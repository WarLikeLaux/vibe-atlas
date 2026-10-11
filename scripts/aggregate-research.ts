import { createHash } from 'node:crypto'
import { openAsBlob } from 'node:fs'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { format } from 'prettier'

import {
    researchCatalogSchema,
    researchDocumentSchema,
    researchJobsSchema,
    validateResearchDocument,
} from '../src/data/research-schema.ts'

const jobs = researchJobsSchema.parse(JSON.parse(await readFile('data/research-jobs.json', 'utf8')))
if (new Set(jobs.jobs.map((job) => job.id)).size !== jobs.jobs.length)
    throw new Error('Duplicate research dataset identifiers')

const datasets = await Promise.all(
    jobs.jobs.map(async (job) => {
        const sourceFile = await openAsBlob(job.sourcePath)
        const source = await sourceFile.text()
        const reviewFile = await openAsBlob(job.reviewPath)
        await reviewFile.text()
        const document = researchDocumentSchema.parse(JSON.parse(source))
        validateResearchDocument(document)
        if (document.records.length < job.minimumRecords)
            throw new Error(`Incomplete research dataset: ${job.id}`)
        return {
            id: job.id,
            kind: job.kind,
            sourcePath: job.sourcePath,
            reviewPath: job.reviewPath,
            sourceSha256: createHash('sha256').update(source).digest('hex'),
            document,
        }
    }),
)

const outputPath = 'data/research-catalog.json'
let previous: unknown
try {
    previous = JSON.parse(await readFile(outputPath, 'utf8')) as unknown
} catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
}
if (previous !== undefined) {
    const existing = researchCatalogSchema.parse(previous)
    if (existing.batchId === jobs.batchId) {
        for (const dataset of existing.datasets) {
            const next = datasets.find((entry) => entry.id === dataset.id)
            if (
                next === undefined ||
                dataset.document.records.some(
                    (record) => !next.document.records.some((entry) => entry.id === record.id),
                )
            )
                throw new Error(`Research records disappeared: ${dataset.id}`)
        }
    }
}

const catalog = researchCatalogSchema.parse({
    version: 1,
    batchId: jobs.batchId,
    aggregatedAt: new Date().toISOString(),
    datasets,
})
await mkdir(path.dirname(outputPath), { recursive: true })
const temporary = `${outputPath}.tmp`
await writeFile(
    temporary,
    await format(JSON.stringify(catalog), { parser: 'json', tabWidth: 4, printWidth: 100 }),
)
await rename(temporary, outputPath)
console.info(
    `Aggregated ${datasets.reduce((count, dataset) => count + dataset.document.records.length, 0).toString()} research records from ${datasets.length.toString()} datasets`,
)
