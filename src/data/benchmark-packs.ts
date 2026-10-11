import sourceData from '../../data/benchmark-packs.json' with { type: 'json' }

import { packsSchema, validatePacks } from './benchmark-pack-schema.ts'
import type { ComparisonRun } from './comparison-ranking.ts'

export const benchmarkPacks = packsSchema.parse(sourceData)
validatePacks(benchmarkPacks.packs)

export const packBenchmarks = benchmarkPacks.packs.flatMap((pack) => pack.benchmarks)
export const packRuns: ComparisonRun[] = benchmarkPacks.packs.flatMap((pack) =>
    pack.runs.flatMap((run) =>
        run.modelId === undefined ? [] : [{ ...run, modelId: run.modelId }],
    ),
)
