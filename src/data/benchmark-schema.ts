import { z } from 'zod'

const identifier = z.string().min(1)
const ratio = z.number().min(0).max(1)
const telemetry = z.record(z.string(), z.number().nonnegative().nullable())
const organization = z.looseObject({ slug: identifier, name: identifier })
const agentVersion = z.strictObject({
    version: identifier,
    dateReleased: z.iso.date().nullable(),
})

export const analysisRowSchema = z.looseObject({
    id: identifier,
    agentName: identifier,
    provider: identifier,
    hostModelSlug: identifier,
    display: z.strictObject({ agent: identifier, model: identifier }),
    displayLabel: identifier,
    agentCreator: organization,
    modelCreators: z.array(organization).min(1),
    modelRelease: z.looseObject({ slug: identifier, name: identifier }).nullable(),
    variantOf: z.json(),
    isUnavailable: z.boolean(),
    indexComponentCount: z.number().int().positive(),
    evalCount: z.number().int().positive(),
    indexScore: ratio.nullable(),
    evals: z
        .array(
            z.looseObject({
                datasetIndexName: identifier,
                evaluationDatasetSlug: identifier,
                refDatasetName: identifier,
                weight: ratio,
                mean: telemetry,
                safety: z.json(),
                rewardHacking: z.json(),
            }),
        )
        .min(1),
    mean: telemetry,
    sums: telemetry,
    percentiles: z.record(z.string(), telemetry),
    safety: z.json(),
    versions: z.record(z.string(), z.strictObject({ min: agentVersion, max: agentVersion })),
})

export const analysisSchema = z.strictObject({
    version: z.literal(1),
    evidence: z.strictObject({
        sourceId: z.literal('artificial-analysis-coding'),
        url: z.literal('https://artificialanalysis.ai/agents/coding-agents'),
        methodologyUrl: z.literal(
            'https://artificialanalysis.ai/methodology/coding-agents-benchmarking',
        ),
        checkedAt: z.iso.datetime(),
        retrievedAt: z.iso.datetime().nullish(),
        publishedAt: z.iso.datetime().nullish(),
        parserVersion: z.literal('aa-coding-agents/1'),
        htmlSha256: z.string().regex(/^[a-f\d]{64}$/),
        rowsSha256: z.string().regex(/^[a-f\d]{64}$/),
        indexVersion: z.literal('1.5'),
    }),
    rows: z.array(analysisRowSchema).min(1),
})

const reviewSchema = z.strictObject({
    dimension: z.enum([
        'independence',
        'contamination',
        'saturation',
        'reproducibility',
        'comparability',
    ]),
    status: z.enum(['not-reviewed', 'unknown', 'supported', 'suspected', 'disputed']),
    explanation: identifier,
    sourceUrl: z.url({ protocol: /^https$/ }),
    checkedAt: z.iso.datetime(),
})

export const benchmarkDefinitionsSchema = z.strictObject({
    version: z.literal(1),
    benchmarks: z
        .array(
            z.strictObject({
                id: identifier,
                name: identifier,
                version: identifier.nullable(),
                author: identifier,
                evaluator: z.literal('Artificial Analysis'),
                sourceUrl: z.url({ protocol: /^https$/ }),
                checkedAt: z.iso.datetime(),
                taskCount: z.number().int().positive(),
                attemptsPerTask: z.number().int().positive(),
                purpose: identifier,
                requirements: identifier,
                scoring: identifier,
                reviews: z.array(reviewSchema),
            }),
        )
        .min(1),
})

export type Analysis = z.infer<typeof analysisSchema>
export type AnalysisRow = z.infer<typeof analysisRowSchema>

export function validateAnalysis(analysis: Analysis) {
    const identifiers = new Set(analysis.rows.map((row) => row.id))
    if (identifiers.size !== analysis.rows.length) {
        throw new Error('Duplicate evaluation configuration identifiers')
    }
    for (const row of analysis.rows) {
        const datasets = new Set(row.evals.map((evaluation) => evaluation.datasetIndexName))
        if (datasets.size !== row.evals.length || row.evalCount !== row.evals.length) {
            throw new Error(`Missing or duplicated evaluations: ${row.displayLabel}`)
        }
        if (row.indexComponentCount !== 3 || row.evals.length !== 3) {
            throw new Error('Index composition changed; review the methodology before importing')
        }
        let total = 0
        for (const evaluation of row.evals) {
            const reward = ratio.parse(evaluation.mean['reward'])
            if (Math.abs(evaluation.weight - 1 / 3) > 1e-10) {
                throw new Error('Index weights changed; review the methodology before importing')
            }
            total += reward * evaluation.weight
        }
        if (row.indexScore !== null && Math.abs(total - row.indexScore) > 1e-8) {
            throw new Error(`Index disagrees with component scores: ${row.displayLabel}`)
        }
    }
}
