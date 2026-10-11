import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'

import { catalog } from '../src/data/catalog.ts'
import { modelAnalysisSchema, validateModelAnalysis } from '../src/data/model-schema.ts'

import { extractFlightCollection } from './react-flight.ts'

const { values } = parseArgs({
    options: { stdin: { type: 'boolean', default: false }, 'checked-at': { type: 'string' } },
})
const sourceUrl = 'https://artificialanalysis.ai/leaderboards/models'
const now = new Date().toISOString()
if (values.stdin && !values['checked-at']) throw new Error('Offline input requires --checked-at')

async function sourceHtml() {
    if (!values.stdin) {
        const response = await fetch(sourceUrl, {
            signal: AbortSignal.timeout(30_000),
            headers: { 'User-Agent': 'VibeAtlas/0.1 (+https://github.com/WarLikeLaux/vibe-atlas)' },
        })
        if (!response.ok) throw new Error(`Source returned HTTP ${response.status.toString()}`)
        return response.text()
    }
    process.stdin.setEncoding('utf8')
    let html = ''
    for await (const chunk of process.stdin) {
        if (typeof chunk !== 'string') throw new TypeError('Expected text input')
        html += chunk
    }
    return html
}

const html = await sourceHtml()
const rows = extractFlightCollection(html, 'models', 'intelligenceIndex')
const snapshot = `${JSON.stringify(rows, undefined, 4)}\n`
const digest = (value: string) => createHash('sha256').update(value).digest('hex')
const candidate = modelAnalysisSchema.parse({
    version: 1,
    evidence: {
        sourceId: 'artificial-analysis-models',
        url: sourceUrl,
        checkedAt: values['checked-at'] ?? now,
        retrievedAt: values.stdin ? undefined : now,
        parserVersion: 'aa-models/1',
        htmlSha256: digest(html),
        rowsSha256: digest(snapshot),
    },
    rows,
})
validateModelAnalysis(candidate)
const previousText = await readFile('data/aa-models.json', 'utf8').catch((error: unknown) => {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return
    throw error
})
const previous =
    previousText === undefined ? undefined : modelAnalysisSchema.parse(JSON.parse(previousText))
if (previous) {
    if (candidate.evidence.checkedAt < previous.evidence.checkedAt)
        throw new Error('An older snapshot cannot replace the latest import')
    const currentRows = new Map(candidate.rows.map((row) => [row.slug, row]))
    for (const row of previous.rows) {
        const current = currentRows.get(row.slug)
        if (!current) throw new Error(`Model configuration disappeared: ${row.name}`)
        for (const key of Object.keys(row)) {
            if (!Object.hasOwn(current, key))
                throw new Error(`Published source field disappeared: ${key}`)
        }
    }
}
await mkdir('data/snapshots/aa-models', { recursive: true })
await mkdir('.cache/aa-models', { recursive: true })
if (previous) {
    const historyText = await readFile('data/snapshots/aa-models/history.json', 'utf8').catch(
        (error: unknown) => {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return '[]'
            throw error
        },
    )
    const history = modelAnalysisSchema.array().parse(JSON.parse(historyText))
    if (!history.some((entry) => entry.evidence.htmlSha256 === previous.evidence.htmlSha256))
        history.push(previous)
    await writeFile(
        'data/snapshots/aa-models/history.json',
        `${JSON.stringify(history, undefined, 4)}\n`,
    )
}
await writeFile('.cache/aa-models/current.html', html)
await writeFile('data/snapshots/aa-models/current.json', snapshot)
await writeFile('data/aa-models.json.tmp', `${JSON.stringify(candidate, undefined, 4)}\n`)
await writeFile(
    'data/sources.json.tmp',
    `${JSON.stringify({ ...catalog, sources: catalog.sources.map((source) => (source.id === candidate.evidence.sourceId ? { ...source, status: 'imported', lastCheckedAt: candidate.evidence.checkedAt } : source)) }, undefined, 4)}\n`,
)
await rename('data/aa-models.json.tmp', 'data/aa-models.json')
await rename('data/sources.json.tmp', 'data/sources.json')
console.info(
    `Imported ${candidate.rows.length.toString()} model configurations with all source fields`,
)
