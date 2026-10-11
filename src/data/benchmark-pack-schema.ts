import { z } from 'zod'

const text = z.string().min(1)
const url = z.url({ protocol: /^https$/ })
const date = z.iso.datetime()

export const passportSchema = z.strictObject({
    author: text,
    purpose: text,
    requirements: text,
    scoring: text,
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
                status: z.enum(['not-reviewed', 'unknown', 'supported', 'suspected', 'disputed']),
                explanation: text,
                sourceUrl: url,
                checkedAt: date,
            }),
        )
        .length(5),
})

export const packSchema = z.strictObject({
    id: text,
    sourceId: text,
    checkedAt: date,
    parserVersion: text,
    snapshotPath: z.string().regex(/^data\/snapshots\/[a-z\d-]+\/current\.json$/),
    snapshotSha256: z.string().regex(/^[a-f\d]{64}$/),
    benchmarks: z
        .array(
            z.strictObject({
                id: text,
                name: text,
                context: text,
                unit: text,
                format: z.enum(['percent', 'number']),
                awardEligible: z.boolean(),
                sourceUrl: url,
                methodologyUrl: url,
                checkedAt: date,
                passport: passportSchema,
            }),
        )
        .min(1),
    runs: z
        .array(
            z.strictObject({
                id: text,
                modelId: text.optional(),
                sourceModelName: text,
                benchmarkId: text,
                label: text,
                score: z.number(),
                sourceUrl: url,
                checkedAt: date,
                notes: z.array(text),
                telemetry: z.array(z.strictObject({ name: text, value: z.number(), unit: text })),
                estimated: z.boolean(),
            }),
        )
        .min(1),
})

export const packsSchema = z.strictObject({ version: z.literal(1), packs: z.array(packSchema) })
export type BenchmarkPack = z.infer<typeof packSchema>
export type BenchmarkPassport = z.infer<typeof passportSchema>

export function validatePacks(packs: BenchmarkPack[]) {
    const ids = new Set<string>()
    const runIds = new Set<string>()
    if (new Set(packs.map((pack) => pack.id)).size !== packs.length)
        throw new Error('Duplicate benchmark pack identifiers')
    for (const pack of packs) {
        const ownIds = new Set(pack.benchmarks.map((benchmark) => benchmark.id))
        validateBenchmarks(pack, ids)
        for (const run of pack.runs) {
            if (runIds.has(run.id) || !ownIds.has(run.benchmarkId))
                throw new Error('Duplicate run or unknown benchmark protocol')
            runIds.add(run.id)
            if (run.checkedAt !== pack.checkedAt)
                throw new Error('Run date disagrees with its pack')
        }
    }
}

function validateBenchmarks(pack: BenchmarkPack, ids: Set<string>) {
    for (const benchmark of pack.benchmarks) {
        if (ids.has(benchmark.id)) throw new Error('Duplicate benchmark protocol identifiers')
        ids.add(benchmark.id)
        if (benchmark.checkedAt !== pack.checkedAt)
            throw new Error('Benchmark date disagrees with its pack')
        if (new Set(benchmark.passport.reviews.map((review) => review.dimension)).size !== 5)
            throw new Error('Benchmark passport requires five distinct review dimensions')
    }
}
