import { z } from 'zod'

const text = z.string().min(1)
const nonnegative = z.number().nonnegative()
const sourceRun = z
    .looseObject({
        effort: text.optional(),
        isDefaultEffort: z.boolean().optional(),
        score: nonnegative.max(100),
        avgCost: nonnegative,
        outputTokens: nonnegative,
        avgSteps: nonnegative,
    })
    .catchall(z.json())
const sourceModel = z
    .looseObject({
        key: text,
        version: text,
        label: text,
        runs: z.array(sourceRun).min(1),
    })
    .catchall(z.json())
export const cursorFamiliesSchema = z
    .array(
        z
            .looseObject({
                key: text,
                name: text,
                children: z.array(sourceModel).min(1),
            })
            .catchall(z.json()),
    )
    .min(1)

export const cursorSnapshotSchema = z.strictObject({
    families: cursorFamiliesSchema,
    leaderboardTable: z.array(z.array(z.string())).min(2),
    composerTable: z.array(z.array(z.string())).min(2),
})

export const cursorResultSchema = z.strictObject({
    id: text,
    benchmarkId: text,
    evidenceId: z.enum(['cursorbench', 'cursor-composer']),
    sourceLabel: text,
    model: text,
    sourceModelKey: text.nullish(),
    modelId: z.null().optional(),
    agent: z.string().nullish(),
    agentVersion: z.null().optional(),
    effort: text.nullish(),
    isDefaultEffort: z.boolean().nullish(),
    origin: z.enum(['vendor-evaluation', 'vendor-republication']),
    scorePercent: nonnegative.max(100),
    avgCostUsd: nonnegative.nullish(),
    outputTokens: nonnegative.nullish(),
    avgSteps: nonnegative.nullish(),
    rawCell: text.nullish(),
})

const digest = z.string().regex(/^[a-f\d]{64}$/)
export const cursorAnalysisSchema = z.strictObject({
    version: z.literal(1),
    evidence: z
        .array(
            z.strictObject({
                id: z.enum(['cursorbench', 'cursor-composer']),
                sourceId: text,
                url: z.url({ protocol: /^https$/ }),
                checkedAt: z.iso.datetime(),
                retrievedAt: z.iso.datetime().nullish(),
                publishedAt: z.iso.date().nullish(),
                parserVersion: z.literal('cursor-benchmarks/1'),
                htmlSha256: digest,
                scriptUrl: z.url({ protocol: /^https$/ }).nullish(),
                scriptSha256: digest.nullish(),
            }),
        )
        .length(2),
    snapshotSha256: digest,
    results: z.array(cursorResultSchema).min(1),
})

export const cursorPassportsSchema = z.strictObject({
    version: z.literal(1),
    benchmarks: z
        .array(
            z.strictObject({
                id: text,
                name: text,
                version: text.nullable(),
                author: text,
                purpose: text,
                requirements: text,
                scoring: text,
                datasetTaskCount: z.number().int().positive().nullable(),
                evaluatedTaskCount: z.number().int().positive().nullable(),
                attemptsPerTask: z.number().int().positive().nullable(),
                judge: text.nullable(),
                sourceUrl: z.url({ protocol: /^https$/ }),
                checkedAt: z.iso.datetime(),
                reviews: z
                    .array(
                        z.strictObject({
                            dimension: z.enum([
                                'independence',
                                'contamination',
                                'saturation',
                                'reproducibility',
                                'comparability',
                            ]),
                            status: z.enum(['not-reviewed', 'unknown', 'supported']),
                            explanation: text,
                            sourceUrl: z.url({ protocol: /^https$/ }),
                            checkedAt: z.iso.datetime(),
                        }),
                    )
                    .length(5),
            }),
        )
        .min(1),
})

export type CursorAnalysis = z.infer<typeof cursorAnalysisSchema>
export type CursorSnapshot = z.infer<typeof cursorSnapshotSchema>

export function validateCursorAnalysis(analysis: CursorAnalysis) {
    if (new Set(analysis.results.map((row) => row.id)).size !== analysis.results.length)
        throw new Error('Duplicate Cursor result identifiers')
    if (new Set(analysis.evidence.map((entry) => entry.id)).size !== analysis.evidence.length)
        throw new Error('Duplicate Cursor evidence identifiers')
    for (const row of analysis.results) {
        if (!analysis.evidence.some((entry) => entry.id === row.evidenceId))
            throw new Error('Cursor result has no source evidence')
    }
}
