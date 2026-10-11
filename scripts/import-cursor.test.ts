import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { cursorAnalysisSchema, cursorSnapshotSchema } from '../src/data/cursor-schema.ts'

const importer = path.join(import.meta.dirname, 'import-cursor.ts')
const scriptUrl = 'https://cursor.com/marketing-static/_next/static/chunks/fixture.js'
const family = {
    key: 'fixture',
    name: 'Synthetic family',
    children: [
        {
            key: 'synthetic',
            version: '1',
            label: 'Fixture & tools',
            runs: [
                {
                    effort: 'high',
                    score: 0,
                    avgCost: 0,
                    outputTokens: 17,
                    avgSteps: 63.46,
                    futureMetric: 11,
                },
                { effort: 'low', score: 1, avgCost: 0.1, outputTokens: 3, avgSteps: 1.2 },
            ],
        },
        {
            key: 'composer',
            version: '2.5',
            label: 'Composer 2.5',
            runs: [{ score: 2, avgCost: 0.2, outputTokens: 5, avgSteps: 2.3 }],
        },
    ],
}
const table =
    '<table><thead><tr><th></th><th>Composer 2.5</th><th>GPT-5.5</th></tr></thead><tbody><tr><td>Terminal-Bench 2.0</td><td>12.3%</td><td>34.5%</td></tr><tr><td>SWE-Bench Multilingual</td><td>56.7%</td><td>67.8%</td></tr><tr><td>CursorBench v3.1 (harder tasks)</td><td>23.4%</td><td><span>45.6% xhigh</span><span>12.3% medium (default)</span></td></tr></tbody></table>'

function inputPage(script: string, version = '4.0', cost = '$0') {
    return JSON.stringify({
        leaderboardScript: script,
        leaderboardScriptUrl: scriptUrl,
        leaderboardHtml: `<h1>CursorBench ${version}</h1><script src="${scriptUrl}"></script><table><tr><th></th><th>Model</th><th>Score</th><th>Cost</th><th>Tokens</th><th>Steps</th></tr><tr><td>1</td><td>Fixture &amp; tools High</td><td>0%</td><td>${cost}</td><td>17</td><td>63</td></tr><tr><td>2</td><td>Fixture &amp; tools Low</td><td>1%</td><td>$0.1</td><td>3</td><td>1</td></tr><tr><td>3</td><td>Composer 2.5</td><td>2%</td><td>$0.2</td><td>5</td><td>2</td></tr></table>`,
        composerHtml: `${table}${table}<p>Opus 4.7 and GPT-5.5 use self-reported scores for public evals.</p>`,
    })
}

function importInput(input: string) {
    return spawnSync(
        process.execPath,
        [
            '--experimental-strip-types',
            importer,
            '--stdin',
            '--checked-at',
            '2026-10-10T16:00:00.000Z',
        ],
        { input, encoding: 'utf8' },
    )
}

await test('Cursor CLI preserves precision and all efforts, distinguishes republished scores, and rejects mismatched or executable data without overwriting results', async () => {
    const original = process.cwd()
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vibe-atlas-cursor-'))
    process.chdir(temporary)
    try {
        const script = `let data=${JSON.stringify([family])};process.exit(77);`
        const imported = importInput(inputPage(script))
        assert.equal(imported.status, 0, imported.stderr)
        const before = await readFile('data/cursor-benchmarks.json', 'utf8')
        const snapshotText = await readFile('data/snapshots/cursor/current.json', 'utf8')
        const registry = await readFile('data/sources.json', 'utf8')
        const result = cursorAnalysisSchema.parse(JSON.parse(before))
        const snapshot = cursorSnapshotSchema.parse(JSON.parse(snapshotText))
        assert.deepEqual(snapshot.families, [family])
        assert.equal(result.results.length, 10)
        assert.equal(
            result.results.find((row) => row.sourceLabel === 'Fixture & tools High')?.avgSteps,
            63.46,
        )
        assert.equal(
            result.results.find((row) => row.sourceLabel === 'Fixture & tools High')?.scorePercent,
            0,
        )
        assert.deepEqual(
            result.results
                .filter((row) => row.model === 'GPT-5.5' && row.benchmarkId === 'cursorbench-3.1')
                .map((row) => [row.effort, row.scorePercent]),
            [
                ['xhigh', 45.6],
                ['medium', 12.3],
            ],
        )
        assert.equal(
            result.results.find(
                (row) => row.model === 'GPT-5.5' && row.benchmarkId === 'cursor-terminal-bench-2.0',
            )?.origin,
            'vendor-republication',
        )
        const failures = [
            {
                input: inputPage(script.replace(',"futureMetric":11', '')),
                reason: /source field disappeared: futureMetric/,
            },
            { input: inputPage(script, '5.0'), reason: /CursorBench version changed/ },
            { input: inputPage(script, '4.0', '$999'), reason: /rendered values disagree/ },
            {
                input: inputPage(script.replace('"avgSteps":63.46', '"avgSteps":process.exit(77)')),
                reason: /Executable expression/,
            },
            { input: inputPage(script.replace('"outputTokens":17,', '')), reason: /outputTokens/ },
        ]
        for (const failure of failures) {
            const rejected = importInput(failure.input)
            assert.equal(rejected.status, 1, rejected.stderr)
            assert.match(rejected.stderr, failure.reason)
            assert.equal(await readFile('data/cursor-benchmarks.json', 'utf8'), before)
            assert.equal(await readFile('data/snapshots/cursor/current.json', 'utf8'), snapshotText)
            assert.equal(await readFile('data/sources.json', 'utf8'), registry)
        }
    } finally {
        process.chdir(original)
        await rm(temporary, { recursive: true, force: true })
    }
})
