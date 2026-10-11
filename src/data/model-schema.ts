import { z } from 'zod'

import metricsData from '../../data/model-metrics.json' with { type: 'json' }

const metricSchema = z.strictObject({
    key: z.string().min(1),
    name: z.string().min(1),
    benchmark: z.string().nullable(),
    version: z.string().nullable(),
    unit: z.string().min(1),
    format: z.enum(['number', 'percent']),
    kind: z.enum(['evaluation', 'telemetry']),
    sourceUrl: z.url({ protocol: /^https$/ }),
    checkedAt: z.iso.datetime(),
    reviewStatus: z.literal('not-reviewed'),
    optional: z.boolean().default(false),
})

export const modelMetricRegistry = z
    .strictObject({
        version: z.literal(1),
        methodologyVersion: z.literal('4.3.2'),
        metrics: z.array(metricSchema).min(1),
    })
    .parse(metricsData)

const modelRowSchema = z
    .object({
        slug: z.string().min(1),
        name: z.string().min(1),
        shortName: z.string().min(1),
        modelCreatorName: z.string().min(1),
        deprecated: z.boolean(),
        isReasoning: z.boolean(),
        isOpenWeights: z.boolean(),
        intelligenceIndexIsEstimated: z.boolean(),
        intelligenceIndex: z.number().nullable(),
        omniscience: z.number().nullable(),
    })
    .catchall(z.json())

export const modelAnalysisSchema = z.strictObject({
    version: z.literal(1),
    evidence: z.strictObject({
        sourceId: z.literal('artificial-analysis-models'),
        url: z.literal('https://artificialanalysis.ai/leaderboards/models'),
        checkedAt: z.iso.datetime(),
        retrievedAt: z.iso.datetime().optional(),
        parserVersion: z.literal('aa-models/1'),
        htmlSha256: z.string().regex(/^[a-f\d]{64}$/),
        rowsSha256: z.string().regex(/^[a-f\d]{64}$/),
    }),
    rows: z.array(modelRowSchema).min(1),
})

export type ModelMetric = z.infer<typeof metricSchema>
export type ModelRow = z.infer<typeof modelRowSchema>
export type ModelAnalysis = z.infer<typeof modelAnalysisSchema>

export function modelMetricValue(row: ModelRow, key: string) {
    return z
        .number()
        .nullish()
        .parse(new Map(Object.entries(row)).get(key))
}

function validateMetric(row: ModelRow, metric: ModelMetric) {
    const value = modelMetricValue(row, metric.key)
    if (value === undefined && !metric.optional)
        throw new Error(`Required metric disappeared: ${metric.key}`)
    if (metric.kind === 'telemetry' && typeof value === 'number' && value < 0) {
        throw new Error(`Unexpected negative telemetry: ${metric.key}`)
    }
    if (metric.format === 'percent' && typeof value === 'number' && (value < 0 || value > 1)) {
        throw new Error(`Unexpected score scale: ${row.name}, ${metric.key}`)
    }
}

export function validateModelAnalysis(analysis: ModelAnalysis) {
    if (new Set(analysis.rows.map((row) => row.slug)).size !== analysis.rows.length) {
        throw new Error('Duplicate model configuration identifiers')
    }
    for (const row of analysis.rows) {
        for (const metric of modelMetricRegistry.metrics) validateMetric(row, metric)
    }
}
