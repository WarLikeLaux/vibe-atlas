import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { analysisRowSchema, analysisSchema } from '../src/data/benchmark-schema.ts'
import type { AnalysisRow } from '../src/data/benchmark-schema.ts'

// Synthetic transport fixture, never part of the public catalogue.
const firstRow = analysisRowSchema.parse(
    JSON.parse(`{
    "id":"synthetic-a", "agentName":"Test Agent 1.0", "provider":"test",
    "hostModelSlug":"source-alias-a", "display":{"agent":"Test Agent","model":"Synthetic A (high)"},
    "displayLabel":"Test Agent - Synthetic A (high)",
    "agentCreator":{"slug":"test","name":"Fixture"},
    "modelCreators":[{"slug":"test","name":"Fixture"}],
    "modelRelease":null, "variantOf":null, "isUnavailable":false,
    "indexComponentCount":3, "evalCount":3, "indexScore":0.5,
    "evals":[
        {"datasetIndexName":"deep-swe-v1.1","evaluationDatasetSlug":"DeepSWE v1.1","refDatasetName":"test/deep@1","weight":0.3333333333333333,"mean":{"reward":0.25,"inputTokens":100},"safety":{},"rewardHacking":null},
        {"datasetIndexName":"terminal-bench-v4","evaluationDatasetSlug":"Terminal-Bench v4","refDatasetName":"test/terminal@4","weight":0.3333333333333333,"mean":{"reward":0.5},"safety":{},"rewardHacking":{}},
        {"datasetIndexName":"swe-atlas-qna","evaluationDatasetSlug":"SWE-Atlas-QnA","refDatasetName":"test/qna","weight":0.3333333333333333,"mean":{"reward":0.75},"safety":{},"rewardHacking":null}
    ],
    "mean":{"reward":0.5,"costUsd":2,"futureMetric":17,"missingTelemetry":null},
    "sums":{"costUsd":600}, "percentiles":{"costUsd":{"p50":1.5}},
    "safety":{"attemptCount":9}, "versions":{}, "futureMetadata":{"kept":true}
}`),
)
const secondRow = {
    ...firstRow,
    id: 'synthetic-b',
    display: { agent: 'Other Agent', model: 'Synthetic A (max)' },
    displayLabel: 'Other Agent - Synthetic A (max)',
}

function sourcePage(rows: AnalysisRow[], reference = '$a:props:children:props:rows:0') {
    const flight = `a:["$","section",null,{"children":["$","table",null,{"rows":[${JSON.stringify(firstRow)}]}]}]\nb:["$","div",null,{"children":["$","table",null,{"benchmarkRows":${JSON.stringify([reference, ...rows])}}]}]\n`
    // Real pages split records across multiple pushes, including inside JSON strings.
    const split = Math.floor(flight.length / 2)
    const scripts = [flight.slice(0, split), flight.slice(split)]
        .map((chunk) => `<script>self.__next_f.push(${JSON.stringify([1, chunk])})</script>`)
        .join('')
    return `<title>Coding Agent Index v1.5</title><script>self.__next_f.push([0])</script>${scripts}`
}

const importer = path.join(import.meta.dirname, 'import-artificial-analysis.ts')
function importPage(html: string) {
    return spawnSync(
        process.execPath,
        [
            '--experimental-strip-types',
            importer,
            '--stdin',
            '--checked-at',
            '2026-10-10T14:53:23.000Z',
        ],
        { input: html, encoding: 'utf8' },
    )
}

await test('CLI imports all configurations and telemetry; a rejected update preserves the successful catalogue', async () => {
    const originalDirectory = process.cwd()
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'vibe-atlas-import-'))
    process.chdir(temporaryDirectory)
    try {
        const html = sourcePage([secondRow])
        const imported = importPage(html)
        assert.equal(imported.status, 0, imported.stderr)
        const catalogue = await readFile('data/artificial-analysis.json', 'utf8')
        const sourceSnapshot = await readFile(
            'data/snapshots/artificial-analysis/current.json',
            'utf8',
        )
        const registry = await readFile('data/sources.json', 'utf8')
        const result = analysisSchema.parse(JSON.parse(catalogue))
        assert.equal(result.rows.length, 2)
        assert.deepEqual(result.rows, [firstRow, secondRow])
        assert.equal(result.rows[0]?.mean['futureMetric'], 17)
        assert.equal(result.rows[0].indexScore, 0.5)
        assert.equal(
            result.evidence.rowsSha256,
            createHash('sha256').update(sourceSnapshot).digest('hex'),
        )
        assert.equal(result.evidence.htmlSha256, createHash('sha256').update(html).digest('hex'))

        const invalidScore = { ...secondRow, indexScore: 0.9 }
        const missingPercentile = { ...secondRow, percentiles: { costUsd: {} } }
        const failures = [
            { html: sourcePage([]), reason: /configuration disappeared/ },
            { html: sourcePage([invalidScore]), reason: /Index disagrees/ },
            { html: sourcePage([missingPercentile]), reason: /metric disappeared: p50/ },
            {
                html: sourcePage([secondRow], '$a:props:children:props:rows:99'),
                reason: /Unresolved Flight reference/,
            },
            {
                html: html.replace('Index v1.5', 'Index v2.0'),
                reason: /Unrecognized index version/,
            },
        ]
        for (const failure of failures) {
            const rejected = importPage(failure.html)
            assert.equal(rejected.status, 1)
            assert.match(rejected.stderr, failure.reason)
            assert.equal(await readFile('data/artificial-analysis.json', 'utf8'), catalogue)
            assert.equal(
                await readFile('data/snapshots/artificial-analysis/current.json', 'utf8'),
                sourceSnapshot,
            )
            assert.equal(await readFile('data/sources.json', 'utf8'), registry)
        }
    } finally {
        process.chdir(originalDirectory)
        await rm(temporaryDirectory, { recursive: true, force: true })
    }
})
