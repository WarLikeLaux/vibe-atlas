import { z } from 'zod'

import catalogData from '../../data/model-catalog.json' with { type: 'json' }

import type { BenchmarkPassport } from './benchmark-pack-schema.ts'
import { packBenchmarks, packRuns } from './benchmark-packs.ts'
import { analysis, benchmarkDefinitions, telemetryLabels } from './benchmarks.ts'
import type { ComparisonBenchmark, ComparisonRun } from './comparison-ranking.ts'
import { cursorAnalysis, cursorPassports } from './cursor.ts'
import { modelMetricRegistry } from './model-schema.ts'
import { modelAnalysis, modelViews } from './models.ts'

const modelSchema = z.strictObject({
    id: z.string().min(1),
    name: z.string().min(1),
    vendor: z.string().min(1),
    lineage: z.string().min(1),
    status: z.enum(['selected', 'requested-unconfirmed']),
    sources: z.strictObject({
        aaModels: z.array(z.string().min(1)),
        aaCoding: z.array(z.string().min(1)),
        cursorModels: z.array(z.string().min(1)),
    }),
    evidence: z.strictObject({ url: z.url(), checkedAt: z.iso.datetime() }).optional(),
    note: z.string().min(1),
})

export const comparisonCatalog = z
    .strictObject({ version: z.literal(1), models: z.array(modelSchema).min(1) })
    .parse(catalogData)

const evaluationMetrics = modelMetricRegistry.metrics.filter(
    (metric) => metric.kind === 'evaluation',
)
function benchmarkName(benchmark: { name: string; version: string | null }) {
    return [benchmark.name, benchmark.version].filter(Boolean).join(' ')
}

const excludedMetrics = new Set([
    'intelligenceIndex',
    'omniscienceAccuracy',
    'omniscienceNonHallucination',
])

export const comparisonBenchmarks: ComparisonBenchmark[] = [
    ...packBenchmarks,
    ...benchmarkDefinitions.benchmarks.map((benchmark) => ({
        id: `coding:${benchmark.id}`,
        name: benchmarkName(benchmark),
        context: `AA · харнесс coding agents · ${benchmark.taskCount.toString()} задач`,
        unit: '% pass@1',
        format: 'percent' as const,
        awardEligible: true,
        sourceUrl: analysis.evidence.url,
        methodologyUrl: benchmark.sourceUrl,
        checkedAt: analysis.evidence.checkedAt,
    })),
    ...cursorPassports.benchmarks.map((benchmark) => ({
        id: `cursor:${benchmark.id}`,
        name: benchmarkName(benchmark),
        context:
            benchmark.id === 'cursorbench-4.0'
                ? 'Cursor · текущий замер'
                : 'Cursor · таблица Composer',
        unit: '%',
        format: 'percent' as const,
        // The older CursorBench edition stays inspectable but does not add a second medal.
        awardEligible: benchmark.id !== 'cursorbench-3.1',
        sourceUrl:
            cursorAnalysis.evidence.find(
                (entry) =>
                    entry.id ===
                    (benchmark.id === 'cursorbench-4.0' ? 'cursorbench' : 'cursor-composer'),
            )?.url ?? benchmark.sourceUrl,
        methodologyUrl: benchmark.sourceUrl,
        checkedAt: benchmark.checkedAt,
    })),
    ...evaluationMetrics.map((metric) => ({
        id: `models:${metric.key}`,
        name: metric.name,
        context: 'AA · таблица моделей · харнесс не раскрыт',
        unit: metric.format === 'percent' ? '%' : metric.unit,
        format: metric.format,
        awardEligible: !excludedMetrics.has(metric.key),
        sourceUrl: modelAnalysis.evidence.url,
        methodologyUrl: metric.sourceUrl,
        checkedAt: modelAnalysis.evidence.checkedAt,
    })),
    {
        id: 'coding:index',
        name: 'Coding Agent Index 1.5',
        context: 'AA · составной индекс',
        unit: '%',
        format: 'percent',
        awardEligible: false,
        sourceUrl: analysis.evidence.url,
        methodologyUrl: analysis.evidence.methodologyUrl,
        checkedAt: analysis.evidence.checkedAt,
    },
]

function sourceLookup(key: 'aaModels' | 'aaCoding' | 'cursorModels') {
    const entries = comparisonCatalog.models.flatMap((model) =>
        (new Map(Object.entries(model.sources)).get(key) ?? []).map(
            (source) => [source, model.id] as const,
        ),
    )
    if (new Set(entries.map(([source]) => source)).size !== entries.length)
        throw new Error(`Ambiguous model correspondence: ${key}`)
    return new Map(entries)
}

const codingLookup = sourceLookup('aaCoding')
const modelLookup = sourceLookup('aaModels')
const cursorLookup = sourceLookup('cursorModels')

const codingRuns = analysis.rows.flatMap((row): ComparisonRun[] => {
    const modelId = codingLookup.get(row.id)
    if (!modelId) return []
    const telemetry = [...telemetryLabels].flatMap(([key, [name, unit]]) => {
        const value = new Map(Object.entries(row.mean)).get(key)
        return typeof value === 'number' && name && unit ? [{ name, unit, value }] : []
    })
    const common = {
        modelId,
        label: `${row.display.model} · ${row.agentName}`,
        sourceUrl: analysis.evidence.url,
        checkedAt: analysis.evidence.checkedAt,
        estimated: false,
        telemetry,
    }
    const components = row.evals.map((evaluation) => {
        const versions = new Map(Object.entries(row.versions)).get(evaluation.datasetIndexName)
        return {
            ...common,
            id: `coding:${row.id}:${evaluation.datasetIndexName}`,
            benchmarkId: `coding:${evaluation.datasetIndexName}`,
            score: z.number().parse(evaluation.mean['reward']) * 100,
            notes: [
                `Исходный идентификатор конфигурации: ${row.id}. API ID модели не подтверждён этим сопоставлением.`,
                versions
                    ? `Версии агента: ${versions.min.version} — ${versions.max.version}.`
                    : 'Версия агента неизвестна.',
                'Телеметрия ниже — среднее по попыткам всего набора тестов этой конфигурации; это не интервал результата.',
            ],
        }
    })
    return row.indexScore === null
        ? components
        : [
              ...components,
              {
                  ...common,
                  id: `coding:${row.id}:index`,
                  benchmarkId: 'coding:index',
                  score: row.indexScore * 100,
                  notes: ['Среднее трёх тестов с равными весами. В медалях не учитывается.'],
              },
          ]
})

const modelRuns = modelViews.flatMap(({ source, metrics }): ComparisonRun[] => {
    const modelId = modelLookup.get(source.slug)
    if (!modelId) return []
    const telemetry = modelMetricRegistry.metrics.flatMap((metric) => {
        const value = metrics.get(metric.key)
        return metric.kind === 'telemetry' && typeof value === 'number'
            ? [{ name: metric.name, value, unit: metric.unit }]
            : []
    })
    return evaluationMetrics.flatMap((metric) => {
        const score = metrics.get(metric.key)
        if (typeof score !== 'number') return []
        return [
            {
                id: `models:${source.slug}:${metric.key}`,
                modelId,
                benchmarkId: `models:${metric.key}`,
                label: source.name,
                score: metric.format === 'percent' ? score * 100 : score,
                sourceUrl: modelAnalysis.evidence.url,
                checkedAt: modelAnalysis.evidence.checkedAt,
                estimated:
                    metric.key === 'intelligenceIndex' && source.intelligenceIndexIsEstimated,
                notes: [
                    `Исходный slug AA: ${source.slug}; это не официальный API ID.`,
                    'Протокол AA Models. Версия harness и часть условий в исходной таблице не раскрыты; протокол отличается от AA Coding Agents.',
                ],
                telemetry,
            },
        ]
    })
})

const cursorRuns = cursorAnalysis.results.flatMap((row): ComparisonRun[] => {
    const modelId = cursorLookup.get(row.model)
    const evidence = cursorAnalysis.evidence.find((entry) => entry.id === row.evidenceId)
    if (!modelId || !evidence) return []
    const telemetry = [
        { name: 'Расход API', value: row.avgCostUsd, unit: 'USD / задачу, среднее' },
        {
            name: 'Выходные токены',
            value: row.outputTokens,
            unit: 'токенов; агрегация не раскрыта',
        },
        { name: 'Шаги', value: row.avgSteps, unit: 'шагов, среднее' },
    ].flatMap(({ name, value, unit }) => (typeof value === 'number' ? [{ name, value, unit }] : []))
    return [
        {
            id: `cursor:${row.id}`,
            modelId,
            benchmarkId: `cursor:${row.benchmarkId}`,
            label: `${row.sourceLabel} · ${row.agent ?? 'агент не указан'}`,
            score: row.scorePercent,
            sourceUrl: evidence.url,
            checkedAt: evidence.checkedAt,
            estimated: false,
            notes: [
                row.origin === 'vendor-republication'
                    ? 'Перепубликация самоотчёта вендора; независимый замер Cursor не подтверждён.'
                    : 'Вендорский замер Cursor.',
                `Effort: ${row.effort ?? 'не раскрыт'}. Версия агента и официальный API ID неизвестны.`,
            ],
            telemetry,
        },
    ]
})

export const comparisonRuns = [...codingRuns, ...modelRuns, ...cursorRuns, ...packRuns]

export const comparisonPassports = new Map<string, BenchmarkPassport>([
    ...benchmarkDefinitions.benchmarks.map((entry) => [`coding:${entry.id}`, entry] as const),
    ...cursorPassports.benchmarks.map((entry) => [`cursor:${entry.id}`, entry] as const),
    ...packBenchmarks.map((entry) => [entry.id, entry.passport] as const),
])

if (
    new Set(comparisonCatalog.models.map((model) => model.id)).size !==
    comparisonCatalog.models.length
)
    throw new Error('Duplicate comparison model identifiers')
for (const model of comparisonCatalog.models) {
    for (const slug of model.sources.aaModels) {
        if (!modelAnalysis.rows.some((row) => row.slug === slug))
            throw new Error(`Missing model correspondence: ${slug}`)
    }
    for (const id of model.sources.aaCoding) {
        if (!analysis.rows.some((row) => row.id === id))
            throw new Error(`Missing coding correspondence: ${id}`)
    }
    if (model.status === 'selected' && !model.evidence)
        throw new Error('Selected model requires dated evidence')
    if (
        model.status === 'requested-unconfirmed' &&
        comparisonRuns.some((run) => run.modelId === model.id)
    )
        throw new Error('Unconfirmed version must not inherit another model’s results')
}
