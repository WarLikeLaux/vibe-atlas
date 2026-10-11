import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { packsSchema } from '../src/data/benchmark-pack-schema.ts'

const importer = path.join(import.meta.dirname, 'import-terminal-bench.ts')
const source = {
    leaderboard: {
        id: 'fixture-board',
        package: 'terminal-bench/terminal-bench',
        name: '4-0-0',
        title: 'Terminal-Bench 4.0',
        visibility: 'public',
        dataset_version_ids: ['fixture-dataset'],
        rank_by: [{ accessor: 'metrics.accuracy', direction: 'desc' }],
    },
    rows: [
        {
            id: 'fixture-run',
            leaderboard_id: 'fixture-board',
            status: 'display',
            rank: 1,
            n_trials: 10,
            metadata: {
                model_display: { label: 'GPT-6 Astra', url: 'https://example.org/model' },
                agent_display: { label: 'Codex', url: 'https://example.org/agent' },
                reasoning_effort: 'medium',
                date: '2026-10-01',
            },
            metrics: {
                accuracy: 12.34,
                accuracy_ci95_half_width: 3.11,
                n_trials: 10,
                total_tokens: 9876,
                total_cost_usd: 0,
                output_tokens: 123,
                future_metric: { value: 7 },
            },
        },
    ],
}

function importInput(input: unknown, cwd: string, checkedAt = '2026-10-10T17:00:00.000Z') {
    return spawnSync(
        process.execPath,
        ['--experimental-strip-types', importer, '--stdin', '--checked-at', checkedAt],
        { cwd, input: JSON.stringify(input), encoding: 'utf8' },
    )
}

await test('Terminal-Bench CLI preserves percent precision, totals, unknown fields and unmapped versions; rejected updates leave published files unchanged', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'vibe-atlas-terminal-'))
    const original = process.cwd()
    process.chdir(directory)
    try {
        const input = structuredClone(source)
        const first = input.rows[0]
        assert.ok(first)
        input.rows.push({
            ...structuredClone(first),
            id: 'unmapped-run',
            metadata: {
                ...first.metadata,
                model_display: { label: 'Older unmapped model', url: 'https://example.org/older' },
            },
            metrics: { ...first.metrics, accuracy: 0 },
        })
        const result = importInput(input, directory)
        assert.equal(result.status, 0, result.stderr)
        const readPublished = async () =>
            Promise.all([
                readFile('data/benchmark-packs.json', 'utf8'),
                readFile('data/sources.json', 'utf8'),
                readFile('data/snapshots/terminal-bench/current.json', 'utf8'),
                readFile('data/snapshots/terminal-bench/history.json', 'utf8'),
            ])
        const before = await readPublished()
        const published = packsSchema.parse(JSON.parse(before[0])).packs[0]
        assert.ok(published)
        const mapped = published.runs[0],
            unmapped = published.runs[1]
        assert.ok(mapped)
        assert.ok(unmapped)
        assert.equal(mapped.score, 12.34)
        assert.equal(mapped.modelId, 'gpt-6-astra')
        assert.equal(published.benchmarks.length, 1)
        assert.equal(published.benchmarks[0]?.id, 'terminal:4.0')
        assert.equal(mapped.benchmarkId, 'terminal:4.0')
        assert.equal(unmapped.benchmarkId, 'terminal:4.0')
        assert.equal(unmapped.modelId, undefined)
        assert.equal(unmapped.score, 0)
        assert.deepEqual(
            mapped.telemetry.find((metric) => metric.name === 'Токены'),
            { name: 'Токены', value: 9876, unit: 'токенов, всего по запуску' },
        )
        assert.match(before[2], /future_metric/)
        const mutations = [
            { ...input, leaderboard: { ...input.leaderboard, name: '5-0-0' } },
            {
                ...input,
                leaderboard: { ...input.leaderboard, dataset_version_ids: ['changed-dataset'] },
            },
            { ...input, rows: [first] },
            {
                ...input,
                rows: [{ ...first, metrics: { ...first.metrics, accuracy: 101 } }, input.rows[1]],
            },
            {
                ...input,
                rows: [
                    {
                        ...first,
                        metrics: {
                            accuracy: 12.34,
                            accuracy_ci95_half_width: 3.11,
                            n_trials: 10,
                            total_tokens: 9876,
                            total_cost_usd: 0,
                            output_tokens: 123,
                        },
                    },
                    input.rows[1],
                ],
            },
            {
                ...input,
                rows: [
                    {
                        ...first,
                        metadata: {
                            ...first.metadata,
                            agent_display: {
                                label: 'Unknown harness',
                                url: 'https://example.org/agent',
                            },
                        },
                    },
                    input.rows[1],
                ],
            },
        ]
        for (const mutation of mutations) {
            assert.notEqual(importInput(mutation, directory).status, 0)
            assert.deepEqual(await readPublished(), before)
        }
        assert.notEqual(importInput(input, directory, '2026-10-09T00:00:00.000Z').status, 0)
        assert.deepEqual(await readPublished(), before)
    } finally {
        process.chdir(original)
        await rm(directory, { recursive: true, force: true })
    }
})
