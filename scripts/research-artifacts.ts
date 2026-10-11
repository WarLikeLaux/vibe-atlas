import { createHash } from 'node:crypto'
import { openAsBlob } from 'node:fs'
import { readFile } from 'node:fs/promises'

import { z } from 'zod'

import type { researchCatalogSchema } from '../src/data/research-schema.ts'

const relative = z
    .string()
    .regex(/^[a-zA-Z\d./_-]+$/)
    .refine((value) => !value.startsWith('/') && !value.split('/').includes('..'))
const sha256 = z.string().regex(/^[a-f\d]{64}$/)
const artifactsSchema = z.object({
    artifacts: z.array(z.object({ path: relative, sha256, bytes: z.number().int().nonnegative() })),
})
const checksumsSchema = z.object({ files: z.array(z.object({ file: relative, sha256 })) })

async function verify(filePath: string, expected: string, bytes?: number) {
    const safePath = relative.parse(filePath)
    if (!safePath.startsWith('research/proposals/'))
        throw new Error('Unexpected research artifact location')
    const blob = await openAsBlob(safePath)
    const text = await blob.text()
    if (
        createHash('sha256').update(text).digest('hex') !== expected ||
        (bytes !== undefined && blob.size !== bytes)
    )
        throw new Error('Research artifact digest or length mismatch')
    if (safePath.endsWith('.json')) JSON.parse(text)
}

export async function validateResearchArtifacts(catalog: z.infer<typeof researchCatalogSchema>) {
    const artifacts = artifactsSchema.parse(
        JSON.parse(
            await readFile(
                'research/proposals/20261011-coding-benchmarks-wave1/evidence/artifacts.json',
                'utf8',
            ),
        ),
    )
    for (const artifact of artifacts.artifacts)
        await verify(
            `research/proposals/20261011-coding-benchmarks-wave1/${artifact.path}`,
            artifact.sha256,
            artifact.bytes,
        )
    const checksums = checksumsSchema.parse(
        JSON.parse(
            await readFile('research/proposals/20261011-arenas-polls-wave1/checksums.json', 'utf8'),
        ),
    )
    for (const artifact of checksums.files)
        await verify(
            `research/proposals/20261011-arenas-polls-wave1/${artifact.file}`,
            artifact.sha256,
        )
    for (const dataset of catalog.datasets) {
        for (const record of dataset.document.records) {
            const fields = new Map(Object.entries(record))
            const cardHash = fields.get('sourceCardSha256')
            if (cardHash !== undefined)
                await verify(relative.parse(fields.get('sourceCard')), sha256.parse(cardHash))
        }
    }
    const slopCode = await readFile(
        'research/proposals/20261011-developer-media-wave1/evidence/slopcode-aggregate.json',
        'utf8',
    )
    JSON.parse(slopCode)
    const snapshot = z
        .object({ responseSha256: sha256 })
        .parse(JSON.parse(await readFile('data/snapshots/slopcode/current.json', 'utf8')))
    if (createHash('sha256').update(slopCode).digest('hex') !== snapshot.responseSha256)
        throw new Error('SlopCode original aggregate digest mismatch')
    JSON.parse(
        await readFile(
            'research/proposals/20261011-developer-media-wave1/evidence/slopcode-provenance.json',
            'utf8',
        ),
    )
    JSON.parse(
        await readFile(
            'research/proposals/20261011-developer-media-wave1/evidence/measurements.json',
            'utf8',
        ),
    )
}
