import assert from 'node:assert/strict'
import { test } from 'node:test'

import { comparisonStandings, selectionKey, sortStandings } from '../src/data/comparison-ranking.ts'
import type { ComparisonBenchmark, ComparisonRun } from '../src/data/comparison-ranking.ts'

const models = [
    { id: 'alpha', name: 'Alpha', vendor: 'One' },
    { id: 'beta', name: 'Beta', vendor: 'Two' },
    { id: 'gamma', name: 'Gamma', vendor: 'Three' },
    { id: 'missing', name: 'Missing', vendor: 'Four' },
]
const benchmark: ComparisonBenchmark = {
    id: 'test-v1',
    name: 'Test',
    context: 'Protocol',
    unit: '%',
    format: 'percent',
    awardEligible: true,
    sourceUrl: 'https://example.com/results',
    methodologyUrl: 'https://example.com/protocol',
    checkedAt: '2026-10-10T00:00:00.000Z',
}
function run(
    id: string,
    modelId: string,
    score: number,
    benchmarkId = benchmark.id,
): ComparisonRun {
    return {
        id,
        modelId,
        benchmarkId,
        score,
        label: id,
        sourceUrl: benchmark.sourceUrl,
        checkedAt: benchmark.checkedAt,
        notes: [],
        telemetry: [],
        estimated: false,
    }
}

await test('medals count models once, preserve ties and zero, and follow explicit configuration selection', () => {
    const low = run('alpha-low', 'alpha', 10)
    const high = run('alpha-high', 'alpha', 20)
    const runs = [low, high, { ...high }, run('beta', 'beta', 20), run('gamma', 'gamma', 0)]
    const initial = comparisonStandings(
        models,
        [benchmark],
        runs,
        [benchmark.id],
        new Map(),
        'best',
    )
    assert.deepEqual(
        initial.map((entry) => [entry.model.id, entry.medals, entry.top3, entry.measured]),
        [
            ['alpha', { gold: 1, silver: 0, bronze: 0 }, 1, 1],
            ['beta', { gold: 1, silver: 0, bronze: 0 }, 1, 1],
            ['gamma', { gold: 0, silver: 0, bronze: 1 }, 1, 1],
            ['missing', { gold: 0, silver: 0, bronze: 0 }, 0, 0],
        ],
    )
    const alpha = initial.find((entry) => entry.model.id === 'alpha')?.cells.get(benchmark.id)
    assert.ok(alpha)
    assert.equal(alpha.min, 10)
    assert.equal(alpha.max, 20)
    assert.equal(alpha.runs.length, 2)
    assert.equal(
        initial.find((entry) => entry.model.id === 'gamma')?.cells.get(benchmark.id)?.rank,
        3,
    )
    const chosen = comparisonStandings(
        models,
        [benchmark],
        runs,
        [benchmark.id],
        new Map([[selectionKey('alpha', benchmark.id), low.id]]),
        'best',
    )
    assert.deepEqual(chosen.find((entry) => entry.model.id === 'alpha')?.medals, {
        gold: 0,
        silver: 1,
        bronze: 0,
    })
    assert.equal(
        chosen.find((entry) => entry.model.id === 'alpha')?.cells.get(benchmark.id)?.selected
            ?.score,
        10,
    )
    const minimum = comparisonStandings(
        models,
        [benchmark],
        runs,
        [benchmark.id],
        new Map(),
        'minimum',
    )
    assert.deepEqual(
        minimum.map((entry) => entry.medals),
        chosen.map((entry) => entry.medals),
    )
})

await test('indices, singleton cohorts and estimates do not award medals; missing values sort last both ways', () => {
    const other = { ...benchmark, id: 'singleton' }
    const composite = { ...benchmark, id: 'index', awardEligible: false }
    const runs = [
        run('alpha', 'alpha', 10),
        run('gamma', 'gamma', 0),
        run('beta-only', 'beta', 100, other.id),
        run('index', 'alpha', 999, composite.id),
        { ...run('estimate', 'beta', 900), estimated: true },
    ]
    const standings = comparisonStandings(
        models,
        [benchmark, other, composite],
        runs,
        [benchmark.id, other.id, composite.id],
        new Map(),
        'best',
    )
    assert.deepEqual(standings.find((entry) => entry.model.id === 'alpha')?.medals, {
        gold: 1,
        silver: 0,
        bronze: 0,
    })
    assert.deepEqual(standings.find((entry) => entry.model.id === 'beta')?.medals, {
        gold: 0,
        silver: 0,
        bronze: 0,
    })
    assert.equal(
        standings.find((entry) => entry.model.id === 'beta')?.cells.get(benchmark.id)?.rank,
        undefined,
    )
    assert.equal(sortStandings(standings, benchmark.id, 'ascending').at(-1)?.model.id, 'missing')
    assert.equal(sortStandings(standings, benchmark.id, 'descending').at(-1)?.model.id, 'missing')
    assert.equal(sortStandings(standings, benchmark.id, 'ascending').at(0)?.model.id, 'gamma')
    const none = comparisonStandings(models, [benchmark], runs, [], new Map(), 'best')
    assert.ok(
        none.every((entry) => entry.top10 === 0 && entry.measured === 0 && entry.medals.gold === 0),
    )
})

await test('proximity bands reward 95% and 80% of the top score without touching medals', () => {
    const five = [
        { id: 'one', name: 'One', vendor: 'One' },
        { id: 'two', name: 'Two', vendor: 'Two' },
        { id: 'three', name: 'Three', vendor: 'Three' },
        { id: 'four', name: 'Four', vendor: 'Four' },
        { id: 'five', name: 'Five', vendor: 'Five' },
    ]
    const runs = [
        run('one', 'one', 98),
        run('two', 'two', 95),
        run('three', 'three', 85),
        run('four', 'four', 78),
        { ...run('five-estimate', 'five', 97), estimated: true },
    ]
    const standings = comparisonStandings(
        five,
        [benchmark],
        runs,
        [benchmark.id],
        new Map(),
        'best',
    )
    assert.deepEqual(
        standings.map((entry) => [entry.model.id, entry.close95, entry.close80]),
        [
            ['one', 1, 0],
            ['two', 1, 0],
            ['three', 0, 1],
            ['four', 0, 0],
            ['five', 0, 0],
        ],
    )
    // Medals stay rank-based: estimate without rank gains nothing.
    assert.deepEqual(standings.find((entry) => entry.model.id === 'five')?.medals, {
        gold: 0,
        silver: 0,
        bronze: 0,
    })
    assert.equal(sortStandings(standings, 'close95', 'descending').at(0)?.model.id, 'one')
    assert.equal(sortStandings(standings, 'close80', 'descending').at(0)?.model.id, 'three')
    const zeros = comparisonStandings(
        five,
        [benchmark],
        five.map((model) => run(model.id, model.id, 0)),
        [benchmark.id],
        new Map(),
        'best',
    )
    assert.ok(zeros.every((entry) => entry.close95 === 0 && entry.close80 === 0))
})
