import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'

import { analysisSchema } from '../src/data/benchmark-schema.ts'
import { catalog } from '../src/data/catalog.ts'

import { extractAnalysisRows, validateUpdate } from './artificial-analysis.ts'

const { values } = parseArgs({
    options: {
        stdin: { type: 'boolean', default: false },
        'checked-at': { type: 'string' },
        'retrieved-at': { type: 'string' },
    },
})
const sourceUrl = 'https://artificialanalysis.ai/agents/coding-agents'
const now = new Date().toISOString()
if (values.stdin && !values['checked-at']) {
    throw new Error(
        'Offline input requires --checked-at: the original successful verification time',
    )
}

async function fetchPage() {
    const response = await fetch(sourceUrl, {
        headers: { 'User-Agent': 'VibeAtlas/0.1 (+https://github.com/WarLikeLaux/vibe-atlas)' },
        signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) throw new Error(`Source returned HTTP ${response.status.toString()}`)
    return response.text()
}

async function readStandardInput() {
    process.stdin.setEncoding('utf8')
    let content = ''
    for await (const chunk of process.stdin) {
        if (typeof chunk !== 'string') throw new TypeError('Expected text input')
        content += chunk
    }
    return content
}

const html = values.stdin ? await readStandardInput() : await fetchPage()
const rows = extractAnalysisRows(html)
const snapshot = `${JSON.stringify(rows, undefined, 4)}\n`
const sha256 = (content: string) => createHash('sha256').update(content).digest('hex')
const candidate = analysisSchema.parse({
    version: 1,
    evidence: {
        sourceId: 'artificial-analysis-coding',
        url: sourceUrl,
        methodologyUrl: 'https://artificialanalysis.ai/methodology/coding-agents-benchmarking',
        checkedAt: values['checked-at'] ?? now,
        retrievedAt: values['retrieved-at'] ?? (values.stdin ? undefined : now),
        parserVersion: 'aa-coding-agents/1',
        htmlSha256: sha256(html),
        rowsSha256: sha256(snapshot),
        indexVersion: '1.5',
    },
    rows,
})

async function previousImport(): Promise<unknown> {
    try {
        const content = await readFile('data/artificial-analysis.json', 'utf8')
        return JSON.parse(content) as unknown
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return undefined
        throw error
    }
}

const previous = await previousImport()
validateUpdate(candidate, previous)
// Fixed repository-relative destinations; the page cannot choose filesystem paths.
await mkdir('data/snapshots/artificial-analysis', { recursive: true })
await mkdir('.cache/artificial-analysis', { recursive: true })
if (previous !== undefined) {
    const history = await readFile('data/snapshots/artificial-analysis/history.json', 'utf8').catch(
        (error: unknown) => {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return '[]'
            throw error
        },
    )
    const snapshots = analysisSchema.array().parse(JSON.parse(history))
    const old = analysisSchema.parse(previous)
    if (!snapshots.some((entry) => entry.evidence.htmlSha256 === old.evidence.htmlSha256))
        snapshots.push(old)
    await writeFile(
        'data/snapshots/artificial-analysis/history.json',
        `${JSON.stringify(snapshots, undefined, 4)}\n`,
    )
}
await writeFile('.cache/artificial-analysis/current.html', html)
await writeFile('data/snapshots/artificial-analysis/current.json', snapshot)
await writeFile('data/artificial-analysis.json.tmp', `${JSON.stringify(candidate, undefined, 4)}\n`)
await writeFile(
    'data/sources.json.tmp',
    `${JSON.stringify(
        {
            ...catalog,
            sources: catalog.sources.map((source) =>
                source.id === candidate.evidence.sourceId
                    ? { ...source, status: 'imported', lastCheckedAt: candidate.evidence.checkedAt }
                    : source,
            ),
        },
        undefined,
        4,
    )}\n`,
)
await rename('data/artificial-analysis.json.tmp', 'data/artificial-analysis.json')
await rename('data/sources.json.tmp', 'data/sources.json')
console.info(
    `Imported ${candidate.rows.length.toString()} configurations; all component scores and source telemetry retained`,
)
