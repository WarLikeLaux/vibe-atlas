import { z } from 'zod'

import sourceData from '../../data/sources.json' with { type: 'json' }

const sourceSchema = z
    .strictObject({
        id: z
            .string()
            .regex(/^[a-z\d-]+$/)
            .refine((id) => !id.startsWith('-') && !id.endsWith('-') && !id.includes('--')),
        name: z.string().min(1),
        subject: z.string().min(1),
        url: z.url({ protocol: /^https$/ }),
        kind: z.enum(['benchmark', 'vendor', 'community']),
        status: z.enum(['registered', 'imported']),
        registeredAt: z.iso.date(),
        lastCheckedAt: z.iso.datetime().nullable(),
    })
    .refine((source) => source.status !== 'imported' || source.lastCheckedAt !== null, {
        message: 'Imported sources need a successful verification timestamp',
    })

export const catalogSchema = z.strictObject({
    version: z.literal(1),
    sources: z.array(sourceSchema),
})

export const catalog = catalogSchema.parse(sourceData)

export type Source = z.infer<typeof sourceSchema>
