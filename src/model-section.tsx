import { useEffect, useMemo, useState } from 'react'

import { formatNumber } from './data/benchmarks'
import { comparisonBenchmarks, comparisonCatalog, comparisonRuns } from './data/comparison'
import type { ComparisonBenchmark, ComparisonRun } from './data/comparison-ranking'
import { comparisonStandings } from './data/comparison-ranking'
import { verifiedIdentities } from './data/experience'
import { vendorRecommendations } from './data/guide'

const dateFormat = new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
})

function modelIdFromHash(): string | undefined {
    const match = /^#model\/([\w-]+)$/.exec(globalThis.location.hash)
    return match?.[1]
}

function scoreText(score: number | undefined, benchmark: ComparisonBenchmark, precision = 2) {
    if (score === undefined) return 'Нет данных'
    const suffix = benchmark.format === 'percent' ? '%' : ''
    return `${formatNumber(score, precision)}${suffix}`
}

function ModelRun({
    run,
    benchmark,
}: Readonly<{ run: ComparisonRun; benchmark: ComparisonBenchmark }>) {
    return (
        <li>
            <div className="run-evidence-heading">
                <strong>{run.label}</strong>
                <span>
                    {scoreText(run.score, benchmark, 4)}
                    {run.estimated ? ' · оценка' : ''}
                </span>
            </div>
            <p>
                <a href={run.sourceUrl}>Источник результата</a> · Проверено{' '}
                <time dateTime={run.checkedAt}>{dateFormat.format(new Date(run.checkedAt))}</time>
            </p>
            {run.notes.map((note) => (
                <p key={note}>{note}</p>
            ))}
            {run.telemetry.length > 0 && (
                <details>
                    <summary>Токены, стоимость и другие метрики</summary>
                    <dl className="telemetry-list">
                        {run.telemetry.map((metric) => (
                            <div key={metric.name}>
                                <dt>{metric.name}</dt>
                                <dd>
                                    {formatNumber(metric.value)}
                                    <small>{metric.unit}</small>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </details>
            )}
        </li>
    )
}

export function ModelSection() {
    const [modelId, setModelId] = useState<string | undefined>(() => modelIdFromHash())

    useEffect(() => {
        const onHashChange = () => {
            setModelId(modelIdFromHash())
        }
        globalThis.addEventListener('hashchange', onHashChange)
        return () => {
            globalThis.removeEventListener('hashchange', onHashChange)
        }
    }, [])

    // Bands are computed over the full benchmark set in best mode, like the table defaults.
    const modelBands = useMemo(() => {
        const bands = new Map<string, 'close95' | 'close80'>()
        if (modelId === undefined) return { standing: undefined, bands }
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
        const standing = standings.find((entry) => entry.model.id === modelId)
        for (const benchmark of comparisonBenchmarks) {
            const cell = standing?.cells.get(benchmark.id)
            const selected = cell?.selected
            if (!benchmark.awardEligible || !selected || selected.estimated) continue
            const top = Math.max(
                ...standings.flatMap((entry) => {
                    const candidate = entry.cells.get(benchmark.id)?.selected
                    return candidate && !candidate.estimated ? [candidate.score] : []
                }),
            )
            if (top > 0) {
                const ratio = selected.score / top
                if (ratio >= 0.95) bands.set(benchmark.id, 'close95')
                else if (ratio >= 0.8) bands.set(benchmark.id, 'close80')
            }
        }
        return { standing, bands }
    }, [modelId])

    if (modelId === undefined) return <></>
    const model = comparisonCatalog.models.find((entry) => entry.id === modelId)
    if (!model) {
        return (
            <section className="wrap model-section" aria-labelledby="model-title">
                <h2 id="model-title">Модель не найдена</h2>
                <p>В каталоге нет модели с идентификатором {modelId}.</p>
                <a className="text-link" href="#benchmarks">
                    Вернуться к таблице
                </a>
            </section>
        )
    }
    const runs = comparisonRuns.filter((run) => run.modelId === model.id)
    const byBenchmark = new Map<string, ComparisonRun[]>()
    for (const run of runs) {
        const group = byBenchmark.get(run.benchmarkId) ?? []
        group.push(run)
        byBenchmark.set(run.benchmarkId, group)
    }
    const measured = comparisonBenchmarks.filter((benchmark) => byBenchmark.has(benchmark.id))
    const missing = comparisonBenchmarks.filter((benchmark) => !byBenchmark.has(benchmark.id))

    return (
        <section className="wrap model-section" aria-labelledby="model-title">
            <a className="text-link" href="#benchmarks">
                ← К общей таблице
            </a>
            <h2 id="model-title">{model.name}</h2>
            <p className="benchmark-context">
                {model.vendor} · {model.lineage}
            </p>
            <p>{model.note}</p>
            {model.evidence && (
                <p>
                    <a href={model.evidence.url}>Основание выбора версии</a> · Проверено{' '}
                    <time dateTime={model.evidence.checkedAt}>
                        {dateFormat.format(new Date(model.evidence.checkedAt))}
                    </time>
                </p>
            )}
            {model.status === 'requested-unconfirmed' && (
                <p className="availability-note">Точная версия пока не подтверждена</p>
            )}
            {verifiedIdentities
                .filter((identity) => identity.proposedMapping.catalogId === model.id)
                .map((identity) => (
                    <dl className="identity-list" key={identity.id}>
                        {identity.identifiers
                            .filter((entry) => entry.namespace === 'vendor-api')
                            .map((entry) => (
                                <div key={entry.value}>
                                    <dt>API ID вендора</dt>
                                    <dd>
                                        <code>{entry.value}</code>
                                    </dd>
                                </div>
                            ))}
                        {identity.releaseDate && (
                            <div>
                                <dt>Дата релиза</dt>
                                <dd>{identity.releaseDate}</dd>
                            </div>
                        )}
                        {identity.currentVersionAssessment && (
                            <div>
                                <dt>Актуальность</dt>
                                <dd>{identity.currentVersionAssessment}</dd>
                            </div>
                        )}
                        <div>
                            <dt>Проверено</dt>
                            <dd>{identity.checkedAt}</dd>
                        </div>
                    </dl>
                ))}
            <p className="result-count" role="status">
                Измерена в {measured.length} из {comparisonBenchmarks.length} тестов и протоколов
                {modelBands.standing &&
                    ` · 95% от топ‑1: ${modelBands.standing.close95.toString()} · 80–95%: ${modelBands.standing.close80.toString()} · медалей: ${(
                        modelBands.standing.medals.gold +
                        modelBands.standing.medals.silver +
                        modelBands.standing.medals.bronze
                    ).toString()}`}
            </p>
            {vendorRecommendations.recommendations
                .filter((recommendation) => recommendation.catalogId === model.id)
                .map((recommendation) => (
                    <article className="vendor-advice" key={recommendation.id}>
                        <h3>Что советует вендор</h3>
                        <p>«{recommendation.quote}»</p>
                        <p>Задачи: {recommendation.tasks}</p>
                        <p>
                            <a href={recommendation.sourceUrl}>
                                {recommendation.vendor} · оригинал
                            </a>{' '}
                            · Проверено{' '}
                            <time dateTime={recommendation.checkedAt}>
                                {dateFormat.format(new Date(recommendation.checkedAt))}
                            </time>
                        </p>
                    </article>
                ))}
            {measured.map((benchmark) => {
                const group = (byBenchmark.get(benchmark.id) ?? []).toSorted(
                    (a, b) => b.score - a.score,
                )
                const scores = group.map((run) => run.score)
                const min = Math.min(...scores)
                const max = Math.max(...scores)
                return (
                    <article key={benchmark.id} className="model-benchmark">
                        <h3>
                            {benchmark.name}
                            <span className="metric-unit">
                                {' '}
                                · {benchmark.context} · {benchmark.unit}
                            </span>
                        </h3>
                        <p>
                            Лучший запуск {scoreText(max, benchmark)}
                            {group.length > 1 &&
                                ` · диапазон ${scoreText(min, benchmark)}–${scoreText(max, benchmark)} · ${group.length.toString()} конф.`}
                            {benchmark.awardEligible ? '' : ' · без медалей'}
                            {modelBands.bands.get(benchmark.id) === 'close95' &&
                                ' · в полосе 95%+ от топ‑1'}
                            {modelBands.bands.get(benchmark.id) === 'close80' &&
                                ' · в полосе 80–95% от топ‑1'}
                        </p>
                        <ul className="run-evidence-list">
                            {group.map((run) => (
                                <ModelRun key={run.id} run={run} benchmark={benchmark} />
                            ))}
                        </ul>
                    </article>
                )
            })}
            {missing.length > 0 && (
                <details className="model-missing">
                    <summary>Нет данных: {missing.length}</summary>
                    <ul>
                        {missing.map((benchmark) => (
                            <li key={benchmark.id}>
                                {benchmark.name} · {benchmark.context}
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </section>
    )
}
