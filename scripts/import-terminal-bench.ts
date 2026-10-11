import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'

import { format } from 'prettier'
import { z } from 'zod'

import definitionData from '../data/terminal-bench-definition.json' with { type: 'json' }
import { packsSchema, validatePacks } from '../src/data/benchmark-pack-schema.ts'
import { catalog, catalogSchema } from '../src/data/catalog.ts'

import {
    terminalDefinitionSchema,
    terminalPack,
    terminalSourceSchema,
} from './terminal-bench-source.ts'

const { values } = parseArgs({
    options: { stdin: { type: 'boolean', default: false }, 'checked-at': { type: 'string' } },
})
if (values.stdin && !values['checked-at']) throw new Error('Offline input requires --checked-at')
const endpoint = 'https://ofhuhcpkvzjlejydnvyd.supabase.co/functions/v1/leaderboard-read'
const definition = terminalDefinitionSchema.parse(definitionData)
const digest = (value: string) => createHash('sha256').update(value).digest('hex')
const jsonText = (value: unknown) =>
    format(JSON.stringify(value), { parser: 'json', tabWidth: 4, printWidth: 100 })

async function sourceInput() {
    if (values.stdin) {
        process.stdin.setEncoding('utf8')
        let input = ''
        for await (const chunk of process.stdin) {
            if (typeof chunk !== 'string') throw new TypeError('Expected JSON text input')
            input += chunk
        }
        return terminalSourceSchema.parse(JSON.parse(input))
    }
    const page = await fetch('https://www.tbench.ai/', { signal: AbortSignal.timeout(30_000) })
    if (!page.ok || !/<h1\b[^>]*>TERMINAL-BENCH 4\.0<\/h1>/.test(await page.text()))
        throw new Error('Current Terminal-Bench version changed; review its methodology')
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: 'terminal-bench/terminal-bench', name: '4-0-0' }),
        signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) throw new Error(`Terminal-Bench returned HTTP ${response.status.toString()}`)
    return terminalSourceSchema.parse(await response.json())
}

async function optionalFile(reading: Promise<string>, fallback: string) {
    return reading.catch((error: unknown) => {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return fallback
        throw error
    })
}

function preserveSource(
    before: z.infer<typeof terminalSourceSchema>,
    after: z.infer<typeof terminalSourceSchema>,
) {
    if (
        JSON.stringify(before.leaderboard.dataset_version_ids) !==
        JSON.stringify(after.leaderboard.dataset_version_ids)
    )
        throw new Error('Terminal-Bench dataset changed; review the protocol')
    const current = new Map(after.rows.map((row) => [row.id, row]))
    for (const row of before.rows) {
        const replacement = current.get(row.id)
        if (!replacement) throw new Error('Published Terminal-Bench run disappeared')
        for (const [beforeFields, afterFields] of [
            [row.metadata, replacement.metadata],
            [row.metrics, replacement.metrics],
        ]) {
            const replacementFields = new Map(Object.entries(afterFields ?? {}))
            for (const [key, value] of Object.entries(beforeFields ?? {})) {
                if (
                    !replacementFields.has(key) ||
                    (value !== null && replacementFields.get(key) === null)
                )
                    throw new Error('Published Terminal-Bench field disappeared')
            }
        }
    }
}

const source = await sourceInput()
const snapshotText = await jsonText(source)
const candidate = terminalPack(
    source,
    definition,
    values['checked-at'] ?? new Date().toISOString(),
    digest(snapshotText),
)
const registry = packsSchema.parse(
    JSON.parse(
        await optionalFile(
            readFile('data/benchmark-packs.json', 'utf8'),
            '{"version":1,"packs":[]}',
        ),
    ),
)
const previous = registry.packs.find((pack) => pack.id === candidate.id)
const previousSnapshotText = previous
    ? await readFile('data/snapshots/terminal-bench/current.json', 'utf8')
    : undefined
const previousSnapshot = previous
    ? terminalSourceSchema.parse(JSON.parse(previousSnapshotText ?? 'null'))
    : undefined
if (previous && previousSnapshot) {
    if (candidate.checkedAt < previous.checkedAt)
        throw new Error('An older snapshot cannot replace the current import')
    if (digest(previousSnapshotText ?? '') !== previous.snapshotSha256)
        throw new Error('Previous source checksum mismatch')
    preserveSource(previousSnapshot, source)
}
const updated = packsSchema.parse({
    version: 1,
    packs: [...registry.packs.filter((pack) => pack.id !== candidate.id), candidate],
})
validatePacks(updated.packs)
const sources = JSON.parse(
    await optionalFile(readFile('data/sources.json', 'utf8'), JSON.stringify(catalog)),
) as unknown
const sourceRegistry = catalogSchema.parse(sources)
const registered = sourceRegistry.sources.some((entry) => entry.id === candidate.sourceId)
const sourceEntry = {
    id: candidate.sourceId,
    name: 'Terminal-Bench',
    subject: 'Официальные замеры терминальных агентов',
    url: 'https://www.tbench.ai/',
    kind: 'benchmark',
    status: 'imported',
    registeredAt: candidate.checkedAt.slice(0, 10),
    lastCheckedAt: candidate.checkedAt,
}
const updatedSources = {
    ...sourceRegistry,
    sources: registered
        ? sourceRegistry.sources.map((entry) =>
              entry.id === candidate.sourceId
                  ? { ...entry, lastCheckedAt: candidate.checkedAt, status: 'imported' }
                  : entry,
          )
        : [...sourceRegistry.sources, sourceEntry],
}
const history = z
    .array(z.strictObject({ pack: packsSchema.shape.packs.element, source: terminalSourceSchema }))
    .parse(
        JSON.parse(
            await optionalFile(
                readFile('data/snapshots/terminal-bench/history.json', 'utf8'),
                '[]',
            ),
        ),
    )
if (
    previous &&
    previousSnapshot &&
    previous.snapshotSha256 !== candidate.snapshotSha256 &&
    !history.some((entry) => entry.pack.snapshotSha256 === previous.snapshotSha256)
)
    history.push({ pack: previous, source: previousSnapshot })
await mkdir('data/snapshots/terminal-bench', { recursive: true })
await writeFile('data/snapshots/terminal-bench/history.json.tmp', await jsonText(history))
await writeFile('data/snapshots/terminal-bench/current.json.tmp', snapshotText)
await writeFile('data/benchmark-packs.json.tmp', await jsonText(updated))
await writeFile('data/sources.json.tmp', await jsonText(catalogSchema.parse(updatedSources)))
await rename(
    'data/snapshots/terminal-bench/history.json.tmp',
    'data/snapshots/terminal-bench/history.json',
)
await rename(
    'data/snapshots/terminal-bench/current.json.tmp',
    'data/snapshots/terminal-bench/current.json',
)
await rename('data/benchmark-packs.json.tmp', 'data/benchmark-packs.json')
await rename('data/sources.json.tmp', 'data/sources.json')
console.info(
    `Imported ${candidate.runs.length.toString()} Terminal-Bench runs into a single benchmark`,
)
