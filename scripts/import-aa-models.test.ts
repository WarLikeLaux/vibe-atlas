import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { modelAnalysisSchema } from '../src/data/model-schema.ts'
import { modelAnalysis } from '../src/data/models.ts'

// Reuse the source's transport shape, with synthetic identities and values.
const rows = modelAnalysis.rows.slice(0, 2).map((row, index) => ({
    ...row,
    slug: `Fixture.${index.toString()}`,
    name: `Synthetic ${index.toString()}`,
    intelligenceIndex: 0,
    omniscience: -12,
    futureMetric: 17,
}))
const importer = path.join(import.meta.dirname, 'import-aa-models.ts')

function sourcePage(entries: unknown[]) {
    const flight = `a:["$","page",null,{"modelsAndReleases":{"models":[{"slug":"slim-row","name":"Not an evaluation"}]}}]\nb:["$","table",null,{"models":${JSON.stringify(entries)}}]\n`
    return `<script>self.__next_f.push(${JSON.stringify([1, flight])})</script>`
}

function importRows(entries: unknown[]) {
    return spawnSync(
        process.execPath,
        [
            '--experimental-strip-types',
            importer,
            '--stdin',
            '--checked-at',
            '2026-10-10T15:43:08.000Z',
        ],
        { input: sourcePage(entries), encoding: 'utf8' },
    )
}

await test('model CLI preserves signed, zero, missing and extra data; incomplete updates do not overwrite the catalogue', async () => {
    const originalDirectory = process.cwd()
    const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'vibe-atlas-models-'))
    process.chdir(temporaryDirectory)
    try {
        const imported = importRows(rows)
        assert.equal(imported.status, 0, imported.stderr)
        const before = await readFile('data/aa-models.json', 'utf8')
        const snapshot = await readFile('data/snapshots/aa-models/current.json', 'utf8')
        const registry = await readFile('data/sources.json', 'utf8')
        const result = modelAnalysisSchema.parse(JSON.parse(before))
        assert.deepEqual(result.rows, rows)
        assert.equal(result.rows[0]?.omniscience, -12)
        assert.equal(result.rows[0].intelligenceIndex, 0)
        const missingField = Object.fromEntries(
            Object.entries(rows[0] ?? {}).filter(
                ([key]) => key !== 'medianTimeToFirstTokenSeconds',
            ),
        )
        const failures = [
            { entries: rows.slice(0, 1), reason: /Model configuration disappeared/ },
            { entries: [missingField, rows[1]], reason: /Published source field disappeared/ },
            { entries: [{ ...rows[0], gpqa: 2 }, rows[1]], reason: /Unexpected score scale/ },
        ]
        for (const failure of failures) {
            const rejected = importRows(failure.entries)
            assert.equal(rejected.status, 1)
            assert.match(rejected.stderr, failure.reason)
            assert.equal(await readFile('data/aa-models.json', 'utf8'), before)
            assert.equal(await readFile('data/snapshots/aa-models/current.json', 'utf8'), snapshot)
            assert.equal(await readFile('data/sources.json', 'utf8'), registry)
        }
    } finally {
        process.chdir(originalDirectory)
        await rm(temporaryDirectory, { recursive: true, force: true })
    }
})
