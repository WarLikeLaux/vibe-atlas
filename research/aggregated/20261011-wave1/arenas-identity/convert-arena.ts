import { z } from 'zod'

import { packSchema, validatePacks } from '../../../../src/data/benchmark-pack-schema.ts'

const rowSchema = z.object({
    rank: z.number().int().positive(),
    rank_spread_raw: z.string(),
    model: z.string().min(1),
    score_raw: z.string().min(1),
    votes_raw: z.string().min(1),
    organization_license_raw: z.string(),
    price_per_million_tokens_raw: z.string(),
    context_raw: z.string(),
})
const snapshotSchema = z.object({
    version: z.literal(1),
    snapshots: z.array(
        z.object({
            id: z.string(),
            sourceArtifact: z.string(),
            sourceArtifactSha256: z.string().regex(/^[a-f\d]{64}$/),
            data: z.object({
                source_url: z.url(),
                checked_at: z.iso.datetime(),
                snapshot_date: z.string(),
                displayed_models: z.number().int().positive(),
                rows: z.array(rowSchema).min(1),
            }),
        }),
    ),
})
const definitionsSchema = z.object({
    version: z.literal(1),
    id: z.string(),
    sourceId: z.string(),
    checkedAt: z.iso.datetime(),
    parserVersion: z.string(),
    snapshotPath: packSchema.shape.snapshotPath,
    benchmarks: packSchema.shape.benchmarks,
    modelMappings: z.array(
        z.object({
            sourceModelName: z.string(),
            modelId: z.string(),
            sourceUrl: z.url(),
            checkedAt: z.iso.datetime(),
            basis: z.string(),
        }),
    ),
})

function parseScore(raw: string) {
    const matched = /^(\d+)(?:±(\d+)|\+(\d+)\/-(\d+))( Preliminary)?$/.exec(raw)
    if (!matched) throw new Error(`Unknown Arena score: ${raw}`)
    const score = Number(matched[1])
    const plus = Number(matched[2] ?? matched[3])
    const minus = Number(matched[2] ?? matched[4])
    return { score, plus, minus, preliminary: Boolean(matched[5]) }
}

function parseRankSpread(raw: string) {
    const matched = /^(\d+) (\d+)$/.exec(raw)
    if (!matched) throw new Error(`Unknown Arena rank spread: ${raw}`)
    const lower = Number(matched[1])
    const upper = Number(matched[2])
    if (lower > upper) throw new Error(`Reversed Arena rank spread: ${raw}`)
    return { lower, upper }
}

function parseVotes(raw: string) {
    const groups = raw.split(',')
    const valid =
        groups.length === 1
            ? /^\d+$/.test(raw)
            : /^\d{1,3}$/.test(groups[0] ?? '') &&
              groups.slice(1).every((group) => /^\d{3}$/.test(group))
    if (!valid) throw new Error(`Unknown Arena votes: ${raw}`)
    return Number(raw.replaceAll(',', ''))
}

interface RowContext {
    source: z.infer<typeof snapshotSchema>['snapshots'][number]
    sourceIndex: number
    benchmarkId: string
    checkedAt: string
    mappings: Map<string, string>
    snapshotSha256: string
}

function convertRow(row: z.infer<typeof rowSchema>, index: number, context: RowContext) {
    const { source, sourceIndex, benchmarkId, checkedAt, mappings, snapshotSha256 } = context
    const scenarioId = source.id
    if (row.rank !== index + 1) throw new Error(`Missing Arena source rank: ${scenarioId}`)
    const score = parseScore(row.score_raw)
    const spread = parseRankSpread(row.rank_spread_raw)
    const id = `${scenarioId}:row-${String(row.rank)}`
    const modelId = mappings.get(row.model)
    const notes = [
        `Source configuration: ${row.model}; effort suffix is preserved literally, semantics unknown.`,
        `Published source score: ${row.score_raw}; rank ${String(row.rank)}; rank spread ${row.rank_spread_raw}.`,
        'Published interval confidence level and method for this snapshot are unknown.',
        `Source snapshot date: ${source.data.snapshot_date}; research checked ${source.data.checked_at}.`,
        'Harness version, API serving snapshot, budgets and run date are unknown.',
        `Price per million tokens as published: ${row.price_per_million_tokens_raw}; not benchmark expenditure.`,
        `Context as published: ${row.context_raw}; organization/license: ${row.organization_license_raw}.`,
    ]
    if (score.preliminary) notes.push('Source labels this score Preliminary.')
    if (!modelId) notes.push('No verified editorial model mapping assigned.')
    if (source.data.rows.filter((entry) => entry.model === row.model).length > 1)
        notes.push('Repeated source label: distinct source ranks retained; identity unresolved.')
    const run = {
        id,
        ...(modelId ? { modelId } : {}),
        sourceModelName: row.model,
        benchmarkId: benchmarkId,
        label: row.model,
        score: score.score,
        sourceUrl: source.data.source_url,
        checkedAt: checkedAt,
        notes,
        telemetry: [
            { name: 'source-votes', value: parseVotes(row.votes_raw), unit: 'votes' },
            {
                name: 'score-interval-lower',
                value: score.score - score.minus,
                unit: 'Arena Score points',
            },
            {
                name: 'score-interval-upper',
                value: score.score + score.plus,
                unit: 'Arena Score points',
            },
            { name: 'source-rank', value: row.rank, unit: 'rank' },
            { name: 'source-rank-spread-lower', value: spread.lower, unit: 'rank' },
            { name: 'source-rank-spread-upper', value: spread.upper, unit: 'rank' },
        ],
        estimated: false,
    }
    const receipt = {
        runId: id,
        sourcePointer: `/snapshots/${String(sourceIndex)}/data/rows/${String(index)}`,
        sourceArtifact: source.sourceArtifact,
        sourceArtifactSha256: source.sourceArtifactSha256,
        snapshotSha256,
        sourceUrl: source.data.source_url,
        sourceCheckedAt: source.data.checked_at,
        reviewedAt: checkedAt,
        sourceModelName: row.model,
        scoreRaw: row.score_raw,
        score: score.score,
        rankSpreadRaw: row.rank_spread_raw,
        preliminary: score.preliminary,
        ...(modelId ? { modelId } : {}),
    }
    return { run, receipt }
}

/** Pure converter. Fullstack remains in the snapshot and never creates a protocol. */
export function convertArena(
    snapshotInput: unknown,
    definitionsInput: unknown,
    snapshotSha256: string,
) {
    const snapshot = snapshotSchema.parse(snapshotInput)
    const definitions = definitionsSchema.parse(definitionsInput)
    const mappings = new Map(
        definitions.modelMappings.map((mapping) => [mapping.sourceModelName, mapping.modelId]),
    )
    if (mappings.size !== definitions.modelMappings.length)
        throw new Error('Duplicate Arena model mapping')
    const includedIds = ['arena-webdev', 'arena-coding', 'arena-image-to-webdev']
    if (new Set(snapshot.snapshots.map((entry) => entry.id)).size !== snapshot.snapshots.length)
        throw new Error('Duplicate Arena scenario')
    if (
        definitions.benchmarks.length !== includedIds.length ||
        definitions.benchmarks.some(
            (entry) => !includedIds.some((scenarioId) => entry.id.startsWith(`${scenarioId}:`)),
        )
    )
        throw new Error('Arena definitions must contain exactly three allowed scenario categories')
    const runs: z.infer<typeof packSchema>['runs'] = []
    const receipts = []
    for (const scenarioId of includedIds) {
        const sourceIndex = snapshot.snapshots.findIndex((entry) => entry.id === scenarioId)
        const source = snapshot.snapshots.at(sourceIndex)
        if (!source) throw new Error(`Missing Arena scenario: ${scenarioId}`)
        const benchmark = definitions.benchmarks.find(
            (entry) => entry.id === `${scenarioId}:${source.data.snapshot_date}`,
        )
        if (benchmark?.sourceUrl !== source.data.source_url)
            throw new Error(`Missing or mismatched Arena definition: ${scenarioId}`)
        if (source.data.rows.length !== source.data.displayed_models)
            throw new Error(`Incomplete Arena snapshot: ${scenarioId}`)
        for (const [index, row] of source.data.rows.entries()) {
            const converted = convertRow(row, index, {
                source,
                sourceIndex,
                benchmarkId: benchmark.id,
                checkedAt: definitions.checkedAt,
                mappings,
                snapshotSha256,
            })
            runs.push(converted.run)
            receipts.push(converted.receipt)
        }
    }
    const pack = packSchema.parse({
        id: definitions.id,
        sourceId: definitions.sourceId,
        checkedAt: definitions.checkedAt,
        parserVersion: definitions.parserVersion,
        snapshotPath: definitions.snapshotPath,
        snapshotSha256,
        benchmarks: definitions.benchmarks,
        runs,
    })
    validatePacks([pack])
    return { pack, receipts }
}
