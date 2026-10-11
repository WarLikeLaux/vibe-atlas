import { analysisSchema, validateAnalysis } from '../src/data/benchmark-schema.ts'
import type { Analysis } from '../src/data/benchmark-schema.ts'

import { extractFlightCollection } from './react-flight.ts'

export function extractAnalysisRows(html: string): unknown[] {
    if (!html.includes('Coding Agent Index v1.5')) {
        throw new Error('Unrecognized index version; review the methodology before importing')
    }
    return extractFlightCollection(html, 'benchmarkRows', 'indexScore')
}

function requireMetrics(previous: Record<string, unknown>, next: Record<string, unknown>) {
    for (const metric of Object.keys(previous)) {
        if (!(metric in next)) throw new Error(`Previously published metric disappeared: ${metric}`)
    }
}

function requireEvaluations(previous: Analysis['rows'][number], next: Analysis['rows'][number]) {
    for (const evaluation of previous.evals) {
        const replacement = next.evals.find(
            (entry) => entry.datasetIndexName === evaluation.datasetIndexName,
        )
        if (!replacement)
            throw new Error(
                `Previously published benchmark disappeared: ${evaluation.datasetIndexName}`,
            )
        requireMetrics(evaluation.mean, replacement.mean)
    }
    requireMetrics(previous.mean, next.mean)
    requireMetrics(previous.sums, next.sums)
    requireMetrics(previous.percentiles, next.percentiles)
    const percentiles = new Map(Object.entries(next.percentiles))
    for (const [metric, values] of Object.entries(previous.percentiles)) {
        requireMetrics(values, percentiles.get(metric) ?? {})
    }
}

export function validateUpdate(candidate: Analysis, previous: unknown) {
    validateAnalysis(candidate)
    if (previous === undefined) return
    const old = analysisSchema.parse(previous)
    if (candidate.evidence.checkedAt < old.evidence.checkedAt) {
        throw new Error('An older snapshot cannot replace the latest successful import')
    }
    const newRows = new Map(candidate.rows.map((row) => [row.id, row]))
    for (const row of old.rows) {
        const next = newRows.get(row.id)
        if (!next)
            throw new Error(`Previously published configuration disappeared: ${row.displayLabel}`)
        requireEvaluations(row, next)
    }
}
