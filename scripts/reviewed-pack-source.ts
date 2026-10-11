import { isDeepStrictEqual } from 'node:util'

import { z } from 'zod'

import { packSchema, validatePacks } from '../src/data/benchmark-pack-schema.ts'

const jsonSchema = z.json()
const transformations = z.array(z.literal('strip-percent-sign-and-whitespace-parse-number'))
const receiptSchema = z.strictObject({
    checkedAt: z.iso.datetime(),
    snapshotPath: packSchema.shape.snapshotPath,
    snapshotSha256: packSchema.shape.snapshotSha256,
    runs: z
        .array(
            z.strictObject({
                runId: z.string().min(1),
                scorePointer: z.string().startsWith('/'),
                score: z.number(),
                sourceUrl: z.url({ protocol: /^https$/ }),
                sourceModelName: z.string().min(1),
                configuration: z.record(z.string(), jsonSchema),
                transformations,
                label: z.string().min(1),
                notes: z.array(z.string().min(1)),
                observationSourceUrl: z.url({ protocol: /^https$/ }),
                sourceModelNamePointer: z.string().startsWith('/'),
                configurationPointers: z.record(z.string(), z.string().startsWith('/')),
                telemetryPointers: z.array(
                    z.strictObject({
                        name: z.string().min(1),
                        unit: z.string().min(1),
                        valuePointer: z.string().startsWith('/'),
                        transformations,
                    }),
                ),
            }),
        )
        .min(1),
})
const definitionSchema = packSchema
    .omit({ snapshotPath: true, snapshotSha256: true, runs: true })
    .extend({
        mappings: z
            .array(
                z.strictObject({
                    runId: z.string().min(1),
                    benchmarkId: z.string().min(1),
                    modelId: z.string().min(1).optional(),
                }),
            )
            .min(1),
    })

function sourceValue(
    root: z.infer<typeof jsonSchema>,
    pointer: string,
): z.infer<typeof jsonSchema> {
    let current = root
    for (const token of pointer.slice(1).split('/')) {
        const key = token.replaceAll('~1', '/').replaceAll('~0', '~')
        let next: z.infer<typeof jsonSchema> | undefined
        if (Array.isArray(current)) next = current.at(Number(key))
        else if (current !== null && typeof current === 'object')
            next = new Map(Object.entries(current)).get(key)
        if (next === undefined) throw new Error(`Unknown source pointer: ${pointer}`)
        current = next
    }
    return current
}

function numericValue(value: z.infer<typeof jsonSchema>, steps: z.infer<typeof transformations>) {
    if (steps.length === 0) return z.number().parse(value)
    if (steps.length !== 1) throw new Error('Repeated numerical transformation')
    const percent = z.string().parse(value).trim()
    const numeric = percent.slice(0, -1)
    if (!percent.endsWith('%') || !/^[\d.]+$/.test(numeric))
        throw new Error('Expected published percentage')
    return z.number().parse(Number(numeric))
}

export function reviewedPack(
    snapshotInput: unknown,
    definitionsInput: unknown,
    receiptInput: unknown,
    snapshotSha256: string,
) {
    const snapshot = jsonSchema.parse(snapshotInput)
    const definitions = definitionSchema.parse(definitionsInput)
    const receipt = receiptSchema.parse(receiptInput)
    if (receipt.snapshotSha256 !== snapshotSha256 || receipt.checkedAt !== definitions.checkedAt)
        throw new Error('Reviewed snapshot checksum or date mismatch')
    const mappings = new Map(definitions.mappings.map((entry) => [entry.runId, entry]))
    if (mappings.size !== receipt.runs.length || mappings.size !== definitions.mappings.length)
        throw new Error('Reviewed source coverage or mappings disagree')
    const runs = receipt.runs.map((entry) => {
        const mapping = mappings.get(entry.runId)
        if (!mapping) throw new Error('Missing reviewed model/protocol mapping')
        const score = numericValue(sourceValue(snapshot, entry.scorePointer), entry.transformations)
        if (
            score !== entry.score ||
            sourceValue(snapshot, entry.sourceModelNamePointer) !== entry.sourceModelName
        )
            throw new Error(
                'Reviewed score or source model disagrees with its original observation',
            )
        for (const [field, pointer] of Object.entries(entry.configurationPointers)) {
            if (
                !isDeepStrictEqual(
                    new Map(Object.entries(entry.configuration)).get(field),
                    sourceValue(snapshot, pointer),
                )
            )
                throw new Error('Reviewed configuration disagrees with its source')
        }
        return {
            id: entry.runId,
            ...(mapping.modelId === undefined ? {} : { modelId: mapping.modelId }),
            sourceModelName: entry.sourceModelName,
            benchmarkId: mapping.benchmarkId,
            label: entry.label,
            score,
            sourceUrl: entry.sourceUrl,
            checkedAt: definitions.checkedAt,
            notes: entry.notes,
            telemetry: entry.telemetryPointers.map((metric) => ({
                name: metric.name,
                unit: metric.unit,
                value: numericValue(
                    sourceValue(snapshot, metric.valuePointer),
                    metric.transformations,
                ),
            })),
            estimated: false,
        }
    })
    const pack = packSchema.parse({
        id: definitions.id,
        sourceId: definitions.sourceId,
        checkedAt: definitions.checkedAt,
        parserVersion: definitions.parserVersion,
        benchmarks: definitions.benchmarks,
        snapshotPath: receipt.snapshotPath,
        snapshotSha256,
        runs,
    })
    validatePacks([pack])
    return pack
}
