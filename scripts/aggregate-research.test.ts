import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { researchCatalogSchema } from '../src/data/research-schema.ts'

const aggregator = path.join(import.meta.dirname, 'aggregate-research.ts')

await test('research aggregation preserves unverified evidence and unknown fields; lost, duplicate or invalid records cannot replace the catalogue', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'vibe-atlas-research-'))
    const original = process.cwd()
    process.chdir(directory)
    try {
        await mkdir('data')
        await mkdir('research')
        const input = {
            version: 1,
            sourceCoverage: { originalsRead: 1, unresolved: 1 },
            records: [
                {
                    id: 'unread-post',
                    status: 'needs-context',
                    originalCheckedAt: JSON.parse('null') as unknown,
                    secondaryText: 'A repost is not a verified original',
                    futureField: { costs: [0, 1.2345] },
                },
                {
                    id: 'read-post',
                    status: 'source-verified',
                    originalCheckedAt: '2026-10-10T18:00:00Z',
                    primaryUrl: 'https://example.org/original',
                },
            ],
        }
        const source = 'research/input.json'
        const catalogue = 'data/research-catalog.json'
        await writeFile(source, JSON.stringify(input))
        await writeFile('research/review.md', 'Original and unresolved evidence remain separate.\n')
        await writeFile(
            'data/research-jobs.json',
            JSON.stringify({
                version: 1,
                batchId: 'fixture-batch',
                jobs: [
                    {
                        id: 'fixture-media',
                        kind: 'media',
                        sourcePath: 'research/input.json',
                        reviewPath: 'research/review.md',
                        minimumRecords: 2,
                    },
                ],
            }),
        )
        const invoke = () =>
            spawnSync(process.execPath, ['--experimental-strip-types', aggregator], {
                cwd: directory,
                encoding: 'utf8',
            })
        const success = invoke()
        assert.equal(success.status, 0, success.stderr)
        const before = await readFile(catalogue, 'utf8')
        const dataset = researchCatalogSchema.parse(JSON.parse(before)).datasets[0]
        assert.ok(dataset)
        assert.deepEqual(dataset.document, input)
        const unread = input.records[0]
        assert.ok(unread)
        for (const records of [
            [unread],
            [unread, unread],
            [unread, { id: 'replacement', status: 'source-verified' }],
            [unread, { id: 'read-post', status: 'verified' }],
        ]) {
            await writeFile(source, JSON.stringify({ ...input, records }))
            const rejected = invoke()
            assert.notEqual(rejected.status, 0, rejected.stderr)
            assert.equal(await readFile(catalogue, 'utf8'), before)
        }
    } finally {
        process.chdir(original)
        await rm(directory, { recursive: true, force: true })
    }
})
