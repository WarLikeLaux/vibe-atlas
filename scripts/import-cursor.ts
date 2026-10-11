import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'

import { format } from 'prettier'
import { z } from 'zod'

import { catalog } from '../src/data/catalog.ts'
import {
    cursorAnalysisSchema,
    cursorSnapshotSchema,
    validateCursorAnalysis,
} from '../src/data/cursor-schema.ts'
import type { CursorAnalysis, CursorSnapshot } from '../src/data/cursor-schema.ts'

import { cursorResults, extractCursorFamilies, extractCursorTable } from './cursor-source.ts'

const inputSchema = z.strictObject({
    leaderboardHtml: z.string().min(1),
    leaderboardScript: z.string().min(1),
    leaderboardScriptUrl: z.url({ protocol: /^https$/ }),
    composerHtml: z.string().min(1),
    retrievedAt: z.iso.datetime().nullable().optional(),
})
const { values } = parseArgs({
    options: { stdin: { type: 'boolean', default: false }, 'checked-at': { type: 'string' } },
})
if (values.stdin && !values['checked-at']) throw new Error('Offline input requires --checked-at')
const leaderboardUrl = 'https://cursor.com/evals'
const composerUrl = 'https://cursor.com/composer'
const digest = (value: string) => createHash('sha256').update(value).digest('hex')

async function fetchText(url: string) {
    const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { 'User-Agent': 'VibeAtlas/0.1 (+https://github.com/WarLikeLaux/vibe-atlas)' },
    })
    if (!response.ok) throw new Error(`Cursor source returned HTTP ${response.status.toString()}`)
    return response.text()
}

function scriptUrls(html: string) {
    return [...html.matchAll(/<script[^>]*src="([^"]+)"/g)]
        .map((match) => new URL(match[1] ?? '', leaderboardUrl).href)
        .filter(
            (url) =>
                new URL(url).origin === 'https://cursor.com' &&
                new URL(url).pathname.startsWith('/marketing-static/_next/static/chunks/'),
        )
}

async function sourceInput() {
    if (values.stdin) {
        process.stdin.setEncoding('utf8')
        let input = ''
        for await (const chunk of process.stdin) {
            if (typeof chunk !== 'string') throw new TypeError('Expected text input')
            input += chunk
        }
        return inputSchema.parse(JSON.parse(input))
    }
    const [leaderboardHtml, composerHtml] = await Promise.all([
        fetchText(leaderboardUrl),
        fetchText(composerUrl),
    ])
    const scripts = await Promise.all(
        scriptUrls(leaderboardHtml).map(async (url) => ({ url, text: await fetchText(url) })),
    )
    const candidates = scripts.filter(
        (script) => script.text.includes('runs:[{') && script.text.includes('outputTokens:'),
    )
    if (candidates.length !== 1) throw new Error('Expected one published Cursor data script')
    const script = candidates[0]
    return inputSchema.parse({
        leaderboardHtml,
        composerHtml,
        leaderboardScript: script?.text,
        leaderboardScriptUrl: script?.url,
        retrievedAt: new Date().toISOString(),
    })
}

function validateUpdate(previous: CursorAnalysis, candidate: CursorAnalysis) {
    if ((candidate.evidence[0]?.checkedAt ?? '') < (previous.evidence[0]?.checkedAt ?? ''))
        throw new Error('An older snapshot cannot replace the latest Cursor import')
    const current = new Map(candidate.results.map((row) => [row.id, row]))
    for (const row of previous.results) {
        const replacement = current.get(row.id)
        if (!replacement) throw new Error(`Cursor configuration disappeared: ${row.sourceLabel}`)
        for (const metric of ['avgCostUsd', 'outputTokens', 'avgSteps'] as const) {
            const before = new Map(Object.entries(row)).get(metric)
            const after = new Map(Object.entries(replacement)).get(metric)
            if (before !== undefined && before !== null && (after === undefined || after === null))
                throw new Error('Published Cursor telemetry disappeared')
        }
    }
}

function preserveFields(before: Record<string, unknown>, after: Record<string, unknown>) {
    for (const key of Object.keys(before)) {
        if (!Object.hasOwn(after, key))
            throw new Error(`Published Cursor source field disappeared: ${key}`)
    }
}

function preserveModel(
    before: CursorSnapshot['families'][number]['children'][number],
    after: CursorSnapshot['families'][number]['children'][number],
) {
    preserveFields(before, after)
    for (const run of before.runs) {
        const replacement = after.runs.find((entry) => entry.effort === run.effort)
        if (!replacement) throw new Error('Published Cursor effort disappeared')
        preserveFields(run, replacement)
    }
}

function preserveSnapshot(before: CursorSnapshot, after: CursorSnapshot) {
    for (const family of before.families) {
        const replacement = after.families.find((entry) => entry.key === family.key)
        if (!replacement) throw new Error('Published Cursor model family disappeared')
        preserveFields(family, replacement)
        for (const model of family.children) {
            const currentModel = replacement.children.find((entry) => entry.key === model.key)
            if (!currentModel) throw new Error('Published Cursor model disappeared')
            preserveModel(model, currentModel)
        }
    }
}

async function previousFile() {
    return readFile('data/cursor-benchmarks.json', 'utf8').catch((error: unknown) => {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return
        throw error
    })
}

const input = await sourceInput()
if (!scriptUrls(input.leaderboardHtml).includes(input.leaderboardScriptUrl))
    throw new Error('Data script is not linked by the published Cursor page')
if (!/<h1\b[^>]*>CursorBench 4\.0<\/h1>/.test(input.leaderboardHtml))
    throw new Error('CursorBench version changed; review the methodology before importing')
if (!input.composerHtml.includes('Opus 4.7 and GPT-5.5 use self-reported scores for public evals.'))
    throw new Error('Composer public-score attribution changed')
const snapshot = cursorSnapshotSchema.parse({
    families: extractCursorFamilies(input.leaderboardScript),
    leaderboardTable: extractCursorTable(input.leaderboardHtml, 'Composer 2.5'),
    composerTable: extractCursorTable(input.composerHtml, 'Terminal-Bench 2.0'),
})
const snapshotText = await format(JSON.stringify(snapshot), {
    parser: 'json',
    tabWidth: 4,
    printWidth: 100,
})
const checkedAt = values['checked-at'] ?? new Date().toISOString()
const candidate = cursorAnalysisSchema.parse({
    version: 1,
    snapshotSha256: digest(snapshotText),
    results: cursorResults(snapshot),
    evidence: [
        {
            id: 'cursorbench',
            sourceId: 'cursorbench',
            url: leaderboardUrl,
            checkedAt,
            retrievedAt: input.retrievedAt ?? undefined,
            publishedAt: undefined,
            parserVersion: 'cursor-benchmarks/1',
            htmlSha256: digest(input.leaderboardHtml),
            scriptUrl: input.leaderboardScriptUrl,
            scriptSha256: digest(input.leaderboardScript),
        },
        {
            id: 'cursor-composer',
            sourceId: 'cursor-composer',
            url: composerUrl,
            checkedAt,
            retrievedAt: input.retrievedAt ?? undefined,
            publishedAt: undefined,
            parserVersion: 'cursor-benchmarks/1',
            htmlSha256: digest(input.composerHtml),
            scriptUrl: undefined,
            scriptSha256: undefined,
        },
    ],
})
validateCursorAnalysis(candidate)
const previousText = await previousFile()
const previous =
    previousText === undefined ? undefined : cursorAnalysisSchema.parse(JSON.parse(previousText))
const previousSnapshot = previous
    ? cursorSnapshotSchema.parse(
          JSON.parse(await readFile('data/snapshots/cursor/current.json', 'utf8')),
      )
    : undefined
if (previous && previousSnapshot) {
    validateUpdate(previous, candidate)
    preserveSnapshot(previousSnapshot, snapshot)
}
await mkdir('data/snapshots/cursor', { recursive: true })
await mkdir('.cache/cursor', { recursive: true })
if (previous && previousSnapshot) {
    const historyText = await readFile('data/snapshots/cursor/history.json', 'utf8').catch(
        (error: unknown) => {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return '[]'
            throw error
        },
    )
    const history = z
        .array(z.strictObject({ analysis: cursorAnalysisSchema, snapshot: cursorSnapshotSchema }))
        .parse(JSON.parse(historyText))
    if (!history.some((entry) => entry.analysis.snapshotSha256 === previous.snapshotSha256))
        history.push({ analysis: previous, snapshot: previousSnapshot })
    await writeFile(
        'data/snapshots/cursor/history.json',
        await format(JSON.stringify(history), { parser: 'json', tabWidth: 4, printWidth: 100 }),
    )
}
await writeFile('.cache/cursor/current.json', `${JSON.stringify(input)}\n`)
await writeFile('data/snapshots/cursor/current.json', snapshotText)
await writeFile('data/cursor-benchmarks.json.tmp', `${JSON.stringify(candidate, undefined, 4)}\n`)
await writeFile(
    'data/sources.json.tmp',
    `${JSON.stringify(
        {
            ...catalog,
            sources: catalog.sources.map((source) => {
                const evidence = candidate.evidence.find((entry) => entry.sourceId === source.id)
                return evidence
                    ? { ...source, status: 'imported', lastCheckedAt: evidence.checkedAt }
                    : source
            }),
        },
        undefined,
        4,
    )}\n`,
)
await rename('data/cursor-benchmarks.json.tmp', 'data/cursor-benchmarks.json')
await rename('data/sources.json.tmp', 'data/sources.json')
console.info(
    `Imported ${candidate.results.length.toString()} Cursor scores with source precision and provenance`,
)
