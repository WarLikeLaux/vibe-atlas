import { createHash } from 'node:crypto'
import { openAsBlob } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'

import terminalDefinition from '../data/terminal-bench-definition.json' with { type: 'json' }
import { benchmarkPacks } from '../src/data/benchmark-packs.ts'
import { analysis, benchmarkDefinitions } from '../src/data/benchmarks.ts'
import { catalog } from '../src/data/catalog.ts'
import { comparisonBenchmarks, comparisonCatalog, comparisonRuns } from '../src/data/comparison.ts'
import { cursorSnapshotSchema } from '../src/data/cursor-schema.ts'
import { cursorAnalysis, cursorPassports } from '../src/data/cursor.ts'
import { modelMetricRegistry } from '../src/data/model-schema.ts'
import { modelAnalysis } from '../src/data/models.ts'
import { researchCatalogSchema, validateResearchDocument } from '../src/data/research-schema.ts'

import { cursorResults } from './cursor-source.ts'
import { validateResearchArtifacts } from './research-artifacts.ts'
import { loadReviewedBenchmarks } from './research-benchmark-jobs.ts'
import {
    terminalDefinitionSchema,
    terminalPack,
    terminalSourceSchema,
} from './terminal-bench-source.ts'

const identifiers = new Set(catalog.sources.map((source) => source.id))
if (identifiers.size !== catalog.sources.length) {
    throw new Error('Source identifiers must be unique')
}

const snapshot = await readFile('data/snapshots/artificial-analysis/current.json', 'utf8')
if (createHash('sha256').update(snapshot).digest('hex') !== analysis.evidence.rowsSha256) {
    throw new Error('Source snapshot checksum mismatch')
}
if (!isDeepStrictEqual(JSON.parse(snapshot), analysis.rows)) {
    throw new Error('Published results differ from the source snapshot')
}
const benchmarkIds = new Set(benchmarkDefinitions.benchmarks.map((benchmark) => benchmark.id))
if (benchmarkIds.size !== benchmarkDefinitions.benchmarks.length) {
    throw new Error('Benchmark version identifiers must be unique')
}
for (const row of analysis.rows) {
    for (const evaluation of row.evals) {
        if (!benchmarkIds.has(evaluation.datasetIndexName)) {
            throw new Error(`Missing benchmark passport: ${evaluation.datasetIndexName}`)
        }
    }
}
const source = catalog.sources.find((entry) => entry.id === analysis.evidence.sourceId)
if (source?.status !== 'imported' || source.lastCheckedAt !== analysis.evidence.checkedAt) {
    throw new Error('Source registry and imported results disagree')
}
console.info(
    `Validated ${catalog.sources.length.toString()} sources and ${analysis.rows.length.toString()} configurations`,
)

const modelSnapshot = await readFile('data/snapshots/aa-models/current.json', 'utf8')
if (
    createHash('sha256').update(modelSnapshot).digest('hex') !==
        modelAnalysis.evidence.rowsSha256 ||
    !isDeepStrictEqual(JSON.parse(modelSnapshot), modelAnalysis.rows)
) {
    throw new Error('Model source snapshot disagrees with published results')
}
const modelSource = catalog.sources.find((entry) => entry.id === modelAnalysis.evidence.sourceId)
if (
    modelSource?.status !== 'imported' ||
    modelSource.lastCheckedAt !== modelAnalysis.evidence.checkedAt
) {
    throw new Error('Model source registry and imported results disagree')
}
if (
    new Set(modelMetricRegistry.metrics.map((metric) => metric.key)).size !==
    modelMetricRegistry.metrics.length
) {
    throw new Error('Metric identifiers must be unique')
}
console.info(`Validated ${modelAnalysis.rows.length.toString()} model configurations`)

const cursorSnapshotText = await readFile('data/snapshots/cursor/current.json', 'utf8')
const cursorSnapshot = cursorSnapshotSchema.parse(JSON.parse(cursorSnapshotText))
if (
    createHash('sha256').update(cursorSnapshotText).digest('hex') !==
        cursorAnalysis.snapshotSha256 ||
    !isDeepStrictEqual(cursorResults(cursorSnapshot), cursorAnalysis.results)
)
    throw new Error('Cursor source snapshot disagrees with published results')
const cursorBenchmarks = new Set(cursorPassports.benchmarks.map((entry) => entry.id))
if (
    cursorBenchmarks.size !== cursorPassports.benchmarks.length ||
    cursorAnalysis.results.some((row) => !cursorBenchmarks.has(row.benchmarkId))
)
    throw new Error('Missing or duplicated Cursor benchmark passports')
for (const evidence of cursorAnalysis.evidence) {
    const registeredSource = catalog.sources.find((entry) => entry.id === evidence.sourceId)
    if (
        registeredSource?.status !== 'imported' ||
        registeredSource.lastCheckedAt !== evidence.checkedAt
    )
        throw new Error('Cursor source registry and results disagree')
}
console.info(`Validated ${cursorAnalysis.results.length.toString()} Cursor scores`)

const comparisonBenchmarkIds = new Set(comparisonBenchmarks.map((entry) => entry.id))
const comparisonModelIds = new Set(comparisonCatalog.models.map((entry) => entry.id))
if (
    comparisonBenchmarkIds.size !== comparisonBenchmarks.length ||
    new Set(comparisonRuns.map((run) => run.id)).size !== comparisonRuns.length
)
    throw new Error('Duplicated normalized comparison identifiers')
for (const run of comparisonRuns) {
    if (!comparisonBenchmarkIds.has(run.benchmarkId) || !comparisonModelIds.has(run.modelId))
        throw new Error('Comparison result references an unknown model or protocol')
}
console.info(
    `Validated ${comparisonCatalog.models.length.toString()} editorial model entries and ${comparisonRuns.length.toString()} comparison results`,
)

const reviewedSources = await loadReviewedBenchmarks()
for (const pack of benchmarkPacks.packs) {
    const snapshotFile = await openAsBlob(pack.snapshotPath)
    const snapshotText = await snapshotFile.text()
    if (createHash('sha256').update(snapshotText).digest('hex') !== pack.snapshotSha256)
        throw new Error('Benchmark pack checksum mismatch')
    const source = catalog.sources.find((entry) => entry.id === pack.sourceId)
    if (source?.status !== 'imported' || source.lastCheckedAt !== pack.checkedAt)
        throw new Error('Benchmark pack and source registry disagree')
    if (pack.id === 'terminal-bench-4.0') {
        const reconstructed = terminalPack(
            terminalSourceSchema.parse(JSON.parse(snapshotText)),
            terminalDefinitionSchema.parse(terminalDefinition),
            pack.checkedAt,
            pack.snapshotSha256,
        )
        if (!isDeepStrictEqual(reconstructed, pack))
            throw new Error('Terminal-Bench pack differs from its source and editorial definition')
    } else {
        const reviewed = reviewedSources.find((candidate) => candidate.pack.id === pack.id)
        if (reviewed?.snapshotText !== snapshotText || !isDeepStrictEqual(reviewed.pack, pack))
            throw new Error('Benchmark pack differs from its reviewed original observations')
    }
}
console.info(`Validated ${benchmarkPacks.packs.length.toString()} additional benchmark packs`)

const research = researchCatalogSchema.parse(
    JSON.parse(await readFile('data/research-catalog.json', 'utf8')),
)
await validateResearchArtifacts(research)
if (new Set(research.datasets.map((dataset) => dataset.id)).size !== research.datasets.length)
    throw new Error('Duplicate research dataset identifiers')
for (const dataset of research.datasets) {
    validateResearchDocument(dataset.document)
    const sourceFile = await openAsBlob(dataset.sourcePath)
    const sourceText = await sourceFile.text()
    if (
        createHash('sha256').update(sourceText).digest('hex') !== dataset.sourceSha256 ||
        !isDeepStrictEqual(JSON.parse(sourceText), dataset.document)
    )
        throw new Error('Research catalogue differs from its reviewed source')
}
console.info(
    `Validated ${research.datasets.reduce((count, dataset) => count + dataset.document.records.length, 0).toString()} aggregated research records`,
)
