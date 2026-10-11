import * as ts from 'typescript'
import { z } from 'zod'

import { cursorFamiliesSchema, cursorResultSchema } from '../src/data/cursor-schema.ts'
import type { CursorSnapshot } from '../src/data/cursor-schema.ts'

type JsonValue = z.infer<ReturnType<typeof z.json>>

function literalProperty(property: ts.ObjectLiteralElementLike): [string, JsonValue] {
    if (
        !ts.isPropertyAssignment(property) ||
        (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name))
    )
        throw new Error('Unsupported property in published Cursor data')
    return [property.name.text, literalValue(property.initializer).value]
}

function literalValue(node: ts.Expression): { value: JsonValue } {
    if (ts.isStringLiteral(node)) return { value: node.text }
    if (ts.isNumericLiteral(node)) return { value: Number(node.text) }
    if (
        [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(
            node.kind,
        )
    )
        return { value: z.json().parse(JSON.parse(node.getText())) }
    if (ts.isArrayLiteralExpression(node))
        return { value: node.elements.map((element) => literalValue(element).value) }
    if (ts.isObjectLiteralExpression(node))
        return {
            value: Object.fromEntries(node.properties.map((property) => literalProperty(property))),
        }
    if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
        if (node.operator === ts.SyntaxKind.ExclamationToken)
            return { value: !Number(node.operand.text) }
        if (node.operator === ts.SyntaxKind.MinusToken) return { value: -Number(node.operand.text) }
    }
    throw new Error('Executable expression in published Cursor data is not allowed')
}

function hasProperty(node: ts.ObjectLiteralExpression, name: string) {
    return node.properties.some(
        (property) =>
            ts.isPropertyAssignment(property) &&
            (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) &&
            property.name.text === name,
    )
}

// Parse only literal data with the TypeScript parser; never execute the source bundle.
export function extractCursorFamilies(script: string) {
    const parsed = ts.createSourceFile(
        'cursor.js',
        script,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.JS,
    )
    const candidates: unknown[] = []
    function visit(node: ts.Node) {
        if (ts.isArrayLiteralExpression(node)) {
            const first = node.elements[0]
            if (
                first &&
                ts.isObjectLiteralExpression(first) &&
                hasProperty(first, 'name') &&
                hasProperty(first, 'children')
            ) {
                candidates.push(literalValue(node).value)
                return
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(parsed)
    if (candidates.length !== 1) throw new Error('Expected one Cursor model/run data collection')
    return cursorFamiliesSchema.parse(candidates[0])
}

function cellText(html: string) {
    const entities = new Map([
        ['amp', '&'],
        ['lt', '<'],
        ['gt', '>'],
        ['quot', '"'],
        ['apos', "'"],
        ['nbsp', ' '],
    ])
    return html
        .replaceAll(/<!--.*?-->/gs, '')
        .replaceAll(/<[^<>]*>/g, ' ')
        .replaceAll(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity: string) => {
            if (entity.startsWith('#'))
                return String.fromCodePoint(
                    Number.parseInt(
                        entity.slice(entity[1] === 'x' ? 2 : 1),
                        entity[1] === 'x' ? 16 : 10,
                    ),
                )
            return entities.get(entity) ?? ''
        })
        .replaceAll(/\s+/g, ' ')
        .trim()
}

export function extractCursorTable(html: string, marker: string) {
    const tables = new Map<string, string[][]>()
    for (const match of html.matchAll(/<table\b[^>]*>(.*?)<\/table>/gs)) {
        const table = match[1] ?? ''
        if (!table.includes(marker)) continue
        const rows = [...table.matchAll(/<tr\b[^>]*>(.*?)<\/tr>/gs)].map((row) =>
            [...(row[1] ?? '').matchAll(/<t[hd]\b[^>]*>(.*?)<\/t[hd]>/gs)].map((cell) =>
                cellText(cell[1] ?? ''),
            ),
        )
        tables.set(JSON.stringify(rows), rows)
    }
    if (tables.size !== 1) throw new Error('Missing or conflicting published Cursor tables')
    return z.array(z.array(z.string())).parse([...tables.values()][0])
}

const effortLabels = new Map([
    ['max', 'Max'],
    ['xhigh', 'Extra High'],
    ['high', 'High'],
    ['medium', 'Medium'],
    ['low', 'Low'],
    ['minimal', 'Minimal'],
])
const launchBenchmarks = new Map([
    ['Terminal-Bench 2.0', 'cursor-terminal-bench-2.0'],
    ['SWE-Bench Multilingual', 'cursor-swe-bench-multilingual'],
    ['CursorBench v3.1 (harder tasks)', 'cursorbench-3.1'],
])

function launchScores(rawCell: string) {
    const tokens = rawCell.split(/\s+/)
    const scores: {
        scorePercent: number
        effort: string | undefined
        isDefaultEffort: boolean | undefined
    }[] = []
    let index = 0
    while (index < tokens.length) {
        const token = tokens[index++] ?? ''
        if (!/^[\d.]+%$/.test(token))
            throw new Error('Unrecognized Composer benchmark score or effort')
        const scorePercent = z
            .number()
            .min(0)
            .max(100)
            .parse(Number(token.slice(0, -1)))
        const next = tokens.at(index)
        const effort = next && effortLabels.has(next) ? tokens.at(index++) : undefined
        const isDefaultEffort = tokens.at(index) === '(default)' ? true : undefined
        if (isDefaultEffort) index++
        scores.push({ scorePercent, effort, isDefaultEffort })
    }
    return scores
}

function composerResults(table: string[][]) {
    const headers = table[0]
    if (!headers || headers.length < 2 || headers[0] !== '')
        throw new Error('Composer benchmark headers changed')
    return table.slice(1).flatMap((row) => {
        const benchmarkId = launchBenchmarks.get(row[0] ?? '')
        if (!benchmarkId || row.length !== headers.length)
            throw new Error('Composer benchmark coverage changed')
        return row.slice(1).flatMap((rawCell, index) => {
            const model = z
                .string()
                .min(1)
                .parse(headers[index + 1])
            return launchScores(rawCell).map((score) =>
                cursorResultSchema.parse({
                    id: `${benchmarkId}:${model}:${score.effort ?? 'undisclosed'}`,
                    benchmarkId,
                    evidenceId: 'cursor-composer',
                    sourceLabel: [model, score.effort].filter(Boolean).join(' '),
                    model,
                    sourceModelKey: undefined,
                    modelId: undefined,
                    agent: benchmarkId === 'cursorbench-3.1' ? 'Cursor' : undefined,
                    agentVersion: undefined,
                    ...score,
                    origin:
                        /^(Opus|GPT)/.test(model) && benchmarkId !== 'cursorbench-3.1'
                            ? 'vendor-republication'
                            : 'vendor-evaluation',
                    avgCostUsd: undefined,
                    outputTokens: undefined,
                    avgSteps: undefined,
                    rawCell,
                }),
            )
        })
    })
}

export function cursorResults(snapshot: CursorSnapshot) {
    const rows = snapshot.families.flatMap((family) =>
        family.children.flatMap((model) =>
            model.runs.map((run) =>
                cursorResultSchema.parse({
                    id: `cursorbench-4.0:${model.key}:${run.effort ?? 'undisclosed'}`,
                    benchmarkId: 'cursorbench-4.0',
                    evidenceId: 'cursorbench',
                    sourceLabel: [
                        model.label,
                        run.effort ? (effortLabels.get(run.effort) ?? run.effort) : undefined,
                    ]
                        .filter(Boolean)
                        .join(' '),
                    model: model.label,
                    sourceModelKey: model.key,
                    modelId: undefined,
                    agent: 'Cursor',
                    agentVersion: undefined,
                    effort: run.effort ?? undefined,
                    isDefaultEffort: run.isDefaultEffort ?? undefined,
                    origin: 'vendor-evaluation',
                    scorePercent: run.score,
                    avgCostUsd: run.avgCost,
                    outputTokens: run.outputTokens,
                    avgSteps: run.avgSteps,
                    rawCell: undefined,
                }),
            ),
        ),
    )
    const rendered = new Map(snapshot.leaderboardTable.slice(1).map((row) => [row[1], row]))
    if (rendered.size !== rows.length)
        throw new Error('Cursor bundle and rendered table coverage disagree')
    for (const row of rows) {
        const visible = rendered.get(row.sourceLabel)
        if (
            visible?.length !== 6 ||
            Number(visible[2]?.replace('%', '')) !== row.scorePercent ||
            Number(visible[3]?.replace('$', '')) !== row.avgCostUsd ||
            Number(visible[4]?.replaceAll(',', '')) !== row.outputTokens ||
            Number(visible[5]) !== Math.round(row.avgSteps ?? 0)
        )
            throw new Error(`Cursor bundle and rendered values disagree: ${row.sourceLabel}`)
    }
    return [...rows, ...composerResults(snapshot.composerTable)].map((row) =>
        cursorResultSchema.parse(
            Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined)),
        ),
    )
}
