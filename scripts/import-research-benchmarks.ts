import { mkdir, readFile, writeFile } from 'node:fs/promises'

import { format } from 'prettier'

import { packsSchema, validatePacks } from '../src/data/benchmark-pack-schema.ts'
import { catalogSchema } from '../src/data/catalog.ts'
import { comparisonCatalog } from '../src/data/comparison.ts'

import { loadReviewedBenchmarks } from './research-benchmark-jobs.ts'

const candidates = await loadReviewedBenchmarks()
const registry = packsSchema.parse(JSON.parse(await readFile('data/benchmark-packs.json', 'utf8')))
const catalog = catalogSchema.parse(JSON.parse(await readFile('data/sources.json', 'utf8')))
const packMap = new Map(registry.packs.map((pack) => [pack.id, pack]))
const sources = new Map(catalog.sources.map((source) => [source.id, source]))
const selectedModelIds = new Set(
    comparisonCatalog.models
        .filter((model) => model.status === 'selected')
        .map((model) => model.id),
)
for (const candidate of candidates) {
    for (const run of candidate.pack.runs) {
        if (run.modelId !== undefined && !selectedModelIds.has(run.modelId))
            throw new Error('Reviewed result cannot target an unknown or unconfirmed model')
    }
    const previous = packMap.get(candidate.pack.id)
    const runIds = new Set(candidate.pack.runs.map((run) => run.id))
    if (previous?.runs.some((run) => !runIds.has(run.id)))
        throw new Error('Reviewed benchmark update lost a published result')
    packMap.set(candidate.pack.id, candidate.pack)
    sources.set(candidate.source.id, candidate.source)
}
const packs = packsSchema.parse({ version: 1, packs: [...packMap.values()] })
validatePacks(packs.packs)
const nextCatalog = catalogSchema.parse({ version: 1, sources: [...sources.values()] })
const snapshotWriters = new Map([
    [
        'data/snapshots/arena/current.json',
        async (text: string) => {
            await mkdir('data/snapshots/arena', { recursive: true })
            await writeFile('data/snapshots/arena/current.json', text)
        },
    ],
    [
        'data/snapshots/swe-pro-v2-hard51/current.json',
        async (text: string) => {
            await mkdir('data/snapshots/swe-pro-v2-hard51', { recursive: true })
            await writeFile('data/snapshots/swe-pro-v2-hard51/current.json', text)
        },
    ],
    [
        'data/snapshots/programbench/current.json',
        async (text: string) => {
            await mkdir('data/snapshots/programbench', { recursive: true })
            await writeFile('data/snapshots/programbench/current.json', text)
        },
    ],
    [
        'data/snapshots/slopcode/current.json',
        async (text: string) => {
            await mkdir('data/snapshots/slopcode', { recursive: true })
            await writeFile('data/snapshots/slopcode/current.json', text)
        },
    ],
])
for (const candidate of candidates) {
    const writer = snapshotWriters.get(candidate.pack.snapshotPath)
    if (writer === undefined) throw new Error('Unregistered reviewed snapshot destination')
    await writer(candidate.snapshotText)
}
await writeFile(
    'data/benchmark-packs.json',
    await format(JSON.stringify(packs), { parser: 'json', tabWidth: 4, printWidth: 100 }),
)
await writeFile(
    'data/sources.json',
    await format(JSON.stringify(nextCatalog), { parser: 'json', tabWidth: 4, printWidth: 100 }),
)
console.info(`Imported ${candidates.length.toString()} reviewed benchmark packs`)
