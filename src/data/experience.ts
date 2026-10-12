import { z } from 'zod'

import catalogData from '../../data/research-catalog.json' with { type: 'json' }

const opinionSchema = z.looseObject({
    id: z.string().min(1),
    status: z.string().min(1),
    evidenceKind: z.string().min(1),
    platform: z.string().min(1),
    author: z.looseObject({ name: z.string().min(1) }),
    primaryUrl: z.url({ protocol: /^https$/ }).nullable(),
    model: z.looseObject({ rawLabel: z.string().min(1).nullable() }),
    position: z.string().min(1),
    task: z.string().min(1).nullish(),
    summary: z.string().min(1),
    agentAndConfiguration: z.string().nullish(),
    originalCheckedAt: z.iso.datetime().nullish(),
    aggregationCheckedAt: z.iso.datetime(),
})

const pollRowSchema = z.looseObject({
    option: z.string().min(1),
    respondents: z.number().nonnegative().nullish(),
    percent: z.number().min(0).max(100).nullish(),
})

const pollSchema = z.looseObject({
    id: z.string().min(1),
    status: z.string().min(1),
    kind: z.string().min(1),
    question: z.string().min(1).nullish(),
    selection: z.string().min(1).nullish(),
    respondents: z.number().int().positive().nullish(),
    fieldingStart: z.string().min(1).nullish(),
    fieldingEnd: z.string().min(1).nullish(),
    sources: z.array(z.looseObject({ url: z.url({ protocol: /^https$/ }) })).min(1),
    rows: z.array(pollRowSchema),
    checkedAt: z.iso.datetime(),
})

const identitySchema = z.looseObject({
    id: z.string().min(1),
    status: z.string().min(1),
    publishedName: z.string().min(1).nullable(),
    vendor: z.string().min(1).nullable(),
    identifiers: z.array(z.looseObject({ namespace: z.string(), value: z.string() })),
    releaseDate: z.string().nullish(),
    currentVersionAssessment: z.string().nullish(),
    proposedMapping: z.looseObject({ catalogId: z.string().min(1).nullable() }).nullish(),
    checkedAt: z.string().min(1),
})

const datasetSchema = z.looseObject({
    id: z.string().min(1),
    document: z.looseObject({ records: z.array(z.json()) }),
})

const catalogSchema = z.looseObject({ datasets: z.array(datasetSchema).min(1) })

function datasetRecords(id: string): z.infer<typeof z.json>[] {
    const parsed = catalogSchema.parse(catalogData)
    const dataset = parsed.datasets.find((entry) => entry.id === id)
    if (!dataset) throw new Error(`Unknown research dataset: ${id}`)
    return dataset.document.records
}

export const verifiedOpinions = datasetRecords('wave1-media')
    .map((record) => opinionSchema.parse(record))
    .filter(
        (record): record is typeof record & { primaryUrl: string; model: { rawLabel: string } } =>
            record.status === 'source-verified' &&
            record.evidenceKind === 'opinion' &&
            record.primaryUrl !== null &&
            record.model.rawLabel !== null,
    )

export const verifiedPolls = datasetRecords('wave1-polls')
    .map((record) => pollSchema.parse(record))
    .filter(
        (record): record is typeof record & { question: string } =>
            record.status === 'ready-for-integration' &&
            record.question !== null &&
            record.question !== undefined &&
            record.rows.length > 0,
    )

export const verifiedIdentities = datasetRecords('wave1-identities')
    .map((record) => identitySchema.parse(record))
    .filter(
        (record): record is typeof record & { proposedMapping: { catalogId: string } } =>
            record.status === 'source-verified' &&
            record.proposedMapping?.catalogId !== null &&
            record.proposedMapping?.catalogId !== undefined,
    )
