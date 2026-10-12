import { z } from 'zod'

import subscriptionsData from '../../data/subscriptions.json' with { type: 'json' }
import recommendationsData from '../../data/vendor-recommendations.json' with { type: 'json' }

const recommendationSchema = z.strictObject({
    id: z.string().min(1),
    vendor: z.string().min(1),
    model: z.string().min(1),
    catalogId: z.string().min(1).nullable(),
    quote: z.string().min(1),
    tasks: z.string().min(1),
    sourceUrl: z.url({ protocol: /^https$/ }),
    checkedAt: z.iso.datetime(),
})

const recommendationsSchema = z.strictObject({
    version: z.literal(1),
    batchId: z.string().min(1),
    checkedAt: z.iso.datetime(),
    recommendations: z.array(recommendationSchema).min(1),
})

const sourceSchema = z.looseObject({
    url: z.url({ protocol: /^https$/ }),
    checkedAt: z.string().min(1),
})

const limitSchema = z.looseObject({
    name: z.string().min(1),
    value: z
        .union([z.number(), z.string(), z.looseObject({ min: z.number(), max: z.number() })])
        .nullable()
        .optional(),
    unit: z.string().nullable().optional(),
    unknownReason: z.string().nullish(),
    resetWindow: z.looseObject({ description: z.string().min(1) }).nullish(),
})

const subscriptionSchema = z.looseObject({
    id: z.string().min(1),
    status: z.string().min(1),
    vendor: z.string().min(1),
    planLabel: z.string().min(1),
    billing: z
        .looseObject({
            amount: z.number().nonnegative().nullish(),
            currency: z.string().nullish(),
            unit: z.string().nullish(),
            source: sourceSchema.optional(),
        })
        .nullish(),
    modelsInScope: z
        .array(
            z.looseObject({
                catalogPriority: z.string().min(1).nullish(),
                name: z.string().min(1).nullish(),
                pool: z.string().nullish(),
            }),
        )
        .nullish(),
    limits: z.array(limitSchema),
})

const subscriptionsSchema = z.looseObject({
    version: z.literal(1),
    batchId: z.string().min(1),
    checkedAt: z.iso.datetime(),
    note: z.string().min(1),
    subscriptions: z.array(subscriptionSchema).min(1),
})

export const vendorRecommendations = recommendationsSchema.parse(recommendationsData)
export const subscriptionGuide = subscriptionsSchema.parse(subscriptionsData)
