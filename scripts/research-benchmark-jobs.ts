import { createHash } from 'node:crypto'
import { openAsBlob } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'

import { z } from 'zod'

import { convertArena } from '../research/aggregated/20261011-wave1/arenas-identity/convert-arena.ts'
import { packSchema, packsSchema, validatePacks } from '../src/data/benchmark-pack-schema.ts'
import { catalogSchema } from '../src/data/catalog.ts'

import { reviewedPack } from './reviewed-pack-source.ts'

const sourcePath = z
    .string()
    .regex(/^research\/[a-zA-Z\d./_-]+$/)
    .refine((value) => !value.split('/').includes('..'))
const jobsSchema = z.strictObject({
    version: z.literal(1),
    jobs: z
        .array(
            z.strictObject({
                id: z.string().min(1),
                converter: z.enum(['arena', 'reviewed']),
                snapshotSourcePath: sourcePath,
                definitionsPath: sourcePath,
                receiptPath: sourcePath,
                candidatePath: sourcePath,
                source: catalogSchema.shape.sources.element,
            }),
        )
        .min(1),
})

async function readText(filePath: z.infer<typeof sourcePath>) {
    const blob = await openAsBlob(sourcePath.parse(filePath))
    return blob.text()
}

export async function loadReviewedBenchmarks() {
    const registry = jobsSchema.parse(
        JSON.parse(await readFile('data/research-benchmarks.json', 'utf8')),
    )
    if (new Set(registry.jobs.map((job) => job.id)).size !== registry.jobs.length)
        throw new Error('Duplicate reviewed benchmark jobs')
    const candidates = await Promise.all(
        registry.jobs.map(async (job) => {
            const [snapshotText, definitionText, receiptText, candidateText] = await Promise.all([
                readText(job.snapshotSourcePath),
                readText(job.definitionsPath),
                readText(job.receiptPath),
                readText(job.candidatePath),
            ])
            const sha256 = createHash('sha256').update(snapshotText).digest('hex')
            const pack =
                job.converter === 'arena'
                    ? convertArena(JSON.parse(snapshotText), JSON.parse(definitionText), sha256)
                          .pack
                    : reviewedPack(
                          JSON.parse(snapshotText),
                          JSON.parse(definitionText),
                          JSON.parse(receiptText),
                          sha256,
                      )
            const prepared =
                job.converter === 'arena'
                    ? packsSchema.parse(JSON.parse(candidateText)).packs
                    : [packSchema.parse(JSON.parse(candidateText))]
            if (prepared.length !== 1 || !isDeepStrictEqual(pack, prepared[0]))
                throw new Error('Reviewed benchmark differs from reconstructed source observations')
            if (
                job.id !== pack.sourceId ||
                job.source.id !== pack.sourceId ||
                job.source.lastCheckedAt !== pack.checkedAt
            )
                throw new Error('Reviewed benchmark source registry or date mismatch')
            return { pack, snapshotText, source: job.source }
        }),
    )
    validatePacks(candidates.map((candidate) => candidate.pack))
    return candidates
}
