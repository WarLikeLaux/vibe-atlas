import { readFileSync } from 'node:fs'

import type { Plugin } from 'vite'

import type {
    ComparisonBenchmark,
    ComparisonCell,
    ComparisonRun,
    ComparisonStanding,
} from '../src/data/comparison-ranking.ts'
import { comparisonStandings } from '../src/data/comparison-ranking.ts'
import { comparisonBenchmarks, comparisonCatalog, comparisonRuns } from '../src/data/comparison.ts'
import { verifiedIdentities } from '../src/data/experience.ts'
import { vendorRecommendations } from '../src/data/guide.ts'

function escape(value: string | number) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
}

function scoreText(score: number, benchmark: ComparisonBenchmark) {
    const suffix = benchmark.format === 'percent' ? '%' : ''
    return score.toLocaleString('ru', { maximumFractionDigits: 2 }) + suffix
}

function medalFor(rank: number | undefined, eligible: boolean, cohort: number) {
    if (eligible && cohort >= 2 && rank === 1)
        return { name: 'Золото', className: 'medal medal-gold' }
    if (eligible && cohort >= 2 && rank === 2)
        return { name: 'Серебро', className: 'medal medal-silver' }
    if (eligible && cohort >= 2 && rank === 3)
        return { name: 'Бронза', className: 'medal medal-bronze' }
    return { name: '', className: '' }
}

function telemetryList(run: ComparisonRun) {
    if (run.telemetry.length === 0) return ''
    const items = run.telemetry
        .map((metric) => {
            const value = metric.value.toLocaleString('ru')
            const head = '<div><dt>' + escape(metric.name) + '</dt><dd>' + value
            return head + '<small>' + escape(metric.unit) + '</small></dd></div>'
        })
        .join('')
    const open =
        '<details><summary>Токены, стоимость и другие метрики</summary><dl class="telemetry-list">'
    return open + items + '</dl></details>'
}

function runItem(run: ComparisonRun, benchmark: ComparisonBenchmark) {
    const notes = run.notes.map((note) => '<p>' + escape(note) + '</p>').join('')
    const estimated = run.estimated ? ' · оценка' : ''
    const head =
        '<li><div class="run-evidence-heading"><strong>' +
        escape(run.label) +
        '</strong><span>' +
        escape(scoreText(run.score, benchmark)) +
        estimated +
        '</span></div>'
    const source =
        '<p><a href="' +
        escape(run.sourceUrl) +
        '">Источник результата</a> · Проверено <time datetime="' +
        escape(run.checkedAt) +
        '">' +
        escape(run.checkedAt.slice(0, 10)) +
        '</time></p>'
    return head + source + notes + telemetryList(run) + '</li>'
}

function benchmarkArticle(
    benchmark: ComparisonBenchmark,
    group: ComparisonRun[],
    cell: ComparisonCell | undefined,
    top: number,
) {
    const ordered = group.toSorted((a, b) => b.score - a.score)
    const scores = ordered.map((run) => run.score)
    const best = escape(scoreText(Math.max(...scores), benchmark))
    const medal = medalFor(cell?.rank, benchmark.awardEligible, cell?.cohort ?? 0)
    const selected = cell?.selected
    let band = ''
    if (benchmark.awardEligible && top > 0 && selected && !selected.estimated) {
        const ratio = selected.score / top
        if (ratio >= 0.95) band = ' · в полосе 95%+ от топ‑1'
        else if (ratio >= 0.8) band = ' · в полосе 80–95% от топ‑1'
    }
    const rank =
        cell?.rank !== undefined && cell.cohort > 0
            ? ' · №' + cell.rank.toString() + ' из ' + cell.cohort.toString()
            : ''
    const range =
        ordered.length > 1
            ? 'Диапазон ' +
              escape(scoreText(Math.min(...scores), benchmark)) +
              '–' +
              best +
              ' · ' +
              ordered.length.toString() +
              ' конф.'
            : 'Одна конфигурация'
    const medalBadge =
        medal.name === '' ? '' : '<span class="' + medal.className + '"> ' + medal.name + '</span>'
    const context =
        '<span class="metric-unit"> · ' +
        escape(benchmark.context) +
        ' · ' +
        escape(benchmark.unit) +
        '</span>'
    const items = ordered.map((run) => runItem(run, benchmark)).join('')
    const head =
        '<article class="model-benchmark"><h2>' + escape(benchmark.name) + context + '</h2>'
    const result =
        '<p class="model-benchmark-result"><strong>' +
        best +
        '</strong><span>' +
        rank +
        '</span>' +
        medalBadge +
        '</p>'
    const meta = '<p>' + range + (benchmark.awardEligible ? '' : ' · без медалей') + band + '</p>'
    const runs =
        '<details class="model-runs"><summary>Запуски: ' +
        ordered.length.toString() +
        ' · источники и телеметрия внутри</summary><ul class="run-evidence-list">' +
        items +
        '</ul></details></article>'
    return head + result + meta + runs
}

function modelPage(standing: ComparisonStanding, standings: ComparisonStanding[], styles: string) {
    const { model } = standing
    const definition = comparisonCatalog.models.find((entry) => entry.id === model.id)
    const runs = comparisonRuns.filter((run) => run.modelId === model.id)
    const byBenchmark = new Map<string, ComparisonRun[]>()
    for (const run of runs) {
        const group = byBenchmark.get(run.benchmarkId) ?? []
        group.push(run)
        byBenchmark.set(run.benchmarkId, group)
    }
    const measured = comparisonBenchmarks.filter((benchmark) => byBenchmark.has(benchmark.id))
    const missing = comparisonBenchmarks.filter((benchmark) => !byBenchmark.has(benchmark.id))
    const identities = verifiedIdentities.filter(
        (identity) => identity.proposedMapping.catalogId === model.id,
    )
    const advice = vendorRecommendations.recommendations.filter(
        (recommendation) => recommendation.catalogId === model.id,
    )
    const tops = new Map<string, number>()
    for (const benchmark of measured) {
        tops.set(
            benchmark.id,
            Math.max(
                ...standings.flatMap((entry) => {
                    const candidate = entry.cells.get(benchmark.id)?.selected
                    return candidate && !candidate.estimated ? [candidate.score] : []
                }),
            ),
        )
    }
    const sections = measured
        .map((benchmark) =>
            benchmarkArticle(
                benchmark,
                byBenchmark.get(benchmark.id) ?? [],
                standing.cells.get(benchmark.id),
                tops.get(benchmark.id) ?? 0,
            ),
        )
        .join('')
    const medals = standing.medals.gold + standing.medals.silver + standing.medals.bronze
    const identityBlocks = identities
        .map((identity) => {
            const apiIds = identity.identifiers
                .filter((entry) => entry.namespace === 'vendor-api')
                .map(
                    (entry) =>
                        '<div><dt>API ID вендора</dt><dd><code>' +
                        escape(entry.value) +
                        '</code></dd></div>',
                )
                .join('')
            const release = identity.releaseDate
                ? '<div><dt>Дата релиза</dt><dd>' + escape(identity.releaseDate) + '</dd></div>'
                : ''
            return '<dl class="identity-list">' + apiIds + release + '</dl>'
        })
        .join('')
    const adviceBlocks = advice
        .map(
            (recommendation) =>
                '<article class="vendor-advice"><h2>Что советует вендор</h2><p>«' +
                escape(recommendation.quote) +
                '»</p><p>Задачи: ' +
                escape(recommendation.tasks) +
                '</p><p><a href="' +
                escape(recommendation.sourceUrl) +
                '">' +
                escape(recommendation.vendor) +
                ' · оригинал</a></p></article>',
        )
        .join('')
    const missingItems = missing
        .map(
            (benchmark) =>
                '<li>' + escape(benchmark.name) + ' · ' + escape(benchmark.context) + '</li>',
        )
        .join('')
    const head =
        '<!doctype html><html lang="ru"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>' +
        escape(model.name) +
        ' — Vibe Atlas</title><style>' +
        styles +
        '</style></head><body>'
    const header =
        '<header class="site-header wrap"><a class="brand" href="/vibe-atlas/"><span class="brand-symbol" aria-hidden="true">va</span><span>Vibe Atlas</span></a></header>'
    const intro =
        '<main class="wrap model-section"><a class="text-link" href="/vibe-atlas/">← К общей таблице</a><h1>' +
        escape(model.name) +
        '</h1><p class="benchmark-context">' +
        escape(model.vendor) +
        ' · ' +
        escape(definition?.lineage ?? '') +
        '</p><p>' +
        escape(definition?.note ?? '') +
        '</p>'
    const counts =
        '<p class="result-count" role="status">Измерена в ' +
        measured.length.toString() +
        ' из ' +
        comparisonBenchmarks.length.toString() +
        ' тестов и протоколов · 95% от топ‑1: ' +
        standing.close95.toString() +
        ' · 80–95%: ' +
        standing.close80.toString() +
        ' · медалей: ' +
        medals.toString() +
        '</p>'
    const tail =
        '<details class="model-missing"><summary>Нет данных: ' +
        missing.length.toString() +
        '</summary><ul>' +
        missingItems +
        '</ul></details></main><footer class="site-footer wrap"><p>Vibe Atlas</p></footer></body></html>'
    return head + header + intro + identityBlocks + adviceBlocks + counts + sections + tail
}

function safeId(id: string) {
    return id.replaceAll(/[^\w-]/g, '-')
}

export function modelPages(): Plugin {
    return {
        name: 'vibe-atlas-model-pages',
        apply: 'build',
        generateBundle() {
            const styles = readFileSync('src/styles.css', 'utf8')
            const awardIds = comparisonBenchmarks
                .filter((benchmark) => benchmark.awardEligible)
                .map((benchmark) => benchmark.id)
            const standings = comparisonStandings(
                comparisonCatalog.models,
                comparisonBenchmarks,
                comparisonRuns,
                awardIds,
                new Map(),
                'best',
            )
            for (const standing of standings) {
                this.emitFile({
                    type: 'asset',
                    fileName: 'model/' + safeId(standing.model.id) + '/index.html',
                    source: modelPage(standing, standings, styles),
                })
            }
        },
    }
}
