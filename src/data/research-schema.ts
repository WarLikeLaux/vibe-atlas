import { z } from 'zod'

const text = z.string().min(1)
const relativePath = z
    .string()
    .regex(/^(?:research|data)\/[a-zA-Z\d./_-]+$/)
    .refine((value) => !value.split('/').includes('..'))

const recordSchema = z
    .object({
        id: text,
        status: z.enum([
            'candidate',
            'needs-context',
            'source-verified',
            'ready-for-integration',
            'duplicate',
        ]),
    })
    .catchall(z.json())

export const researchDocumentSchema = z
    .object({
        version: z.literal(1),
        records: z.array(recordSchema),
    })
    .catchall(z.json())

export const researchJobsSchema = z.strictObject({
    version: z.literal(1),
    batchId: text,
    jobs: z
        .array(
            z.strictObject({
                id: text,
                kind: z.enum(['media', 'polls', 'identities']),
                sourcePath: relativePath,
                reviewPath: relativePath,
                minimumRecords: z.number().int().positive(),
            }),
        )
        .min(1),
})

export const researchCatalogSchema = z.strictObject({
    version: z.literal(1),
    batchId: text,
    aggregatedAt: z.iso.datetime(),
    datasets: z
        .array(
            z.strictObject({
                id: text,
                kind: z.enum(['media', 'polls', 'identities']),
                sourcePath: relativePath,
                sourceSha256: z.string().regex(/^[a-f\d]{64}$/),
                reviewPath: relativePath,
                document: researchDocumentSchema,
            }),
        )
        .min(1),
})

export function validateResearchDocument(document: z.infer<typeof researchDocumentSchema>) {
    if (new Set(document.records.map((record) => record.id)).size !== document.records.length)
        throw new Error('Duplicate research record identifiers')
}
