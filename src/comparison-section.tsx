import { useMemo, useRef, useState } from 'react'

import modelsDownloadUrl from '../data/aa-models.json?url'
import analysisDownloadUrl from '../data/artificial-analysis.json?url'
import packsDownloadUrl from '../data/benchmark-packs.json?url'
import cursorDownloadUrl from '../data/cursor-benchmarks.json?url'

import { formatNumber } from './data/benchmarks'
import {
    comparisonBenchmarks,
    comparisonCatalog,
    comparisonPassports,
    comparisonRuns,
} from './data/comparison'
import { comparisonStandings, selectionKey, sortStandings } from './data/comparison-ranking'
import type {
    ComparisonBenchmark,
    ComparisonCell,
    ComparisonRun,
    ComparisonStanding,
    ResultMode,
} from './data/comparison-ranking'

const defaults = [
    'coding:deep-swe-v1.1',
    'coding:terminal-bench-v4',
    'coding:swe-atlas-qna',
    'cursor:cursorbench-4.0',
]
const dateFormat = new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
})
const dimensions = new Map([
    ['independence', 'Независимость'],
    ['contamination', 'Риск утечки'],
    ['saturation', 'Насыщение'],
    ['reproducibility', 'Воспроизводимость'],
    ['comparability', 'Сопоставимость'],
])
const statuses = new Map([
    ['supported', 'Есть основания'],
    ['not-reviewed', 'Не проверено'],
    ['unknown', 'Неизвестно'],
    ['suspected', 'Есть подозрения'],
    ['disputed', 'Есть разногласия'],
])

function scoreText(score: number | undefined, benchmark: ComparisonBenchmark, precision = 2) {
    if (score === undefined) return 'Нет данных'
    const suffix = benchmark.format === 'percent' ? '%' : ''
    return `${formatNumber(score, precision)}${suffix}`
}

function Medal({ type, count }: Readonly<{ type: 'gold' | 'silver' | 'bronze'; count: number }>) {
    const labels = new Map([
        ['gold', 'Золото'],
        ['silver', 'Серебро'],
        ['bronze', 'Бронза'],
    ])
    return (
        <span
            className={`medal medal-${type}`}
            aria-label={`${labels.get(type) ?? type}: ${count.toString()}`}
            title={`${labels.get(type) ?? type}: ${count.toString()}`}
        >
            <svg viewBox="0 0 24 28" width="18" height="21" aria-hidden="true">
                <path
                    d="m7 17-1 9 6-3 6 3-1-9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
                <circle cx="12" cy="10" r="8" fill="currentColor" />
                <circle cx="12" cy="10" r="5.5" fill="none" stroke="white" strokeWidth="1" />
            </svg>
            {count}
        </span>
    )
}

function Achievements({ standing }: Readonly<{ standing: ComparisonStanding }>) {
    return (
        <div className="achievements">
            <div className="medal-counts">
                <Medal type="gold" count={standing.medals.gold} />
                <Medal type="silver" count={standing.medals.silver} />
                <Medal type="bronze" count={standing.medals.bronze} />
            </div>
            <span>
                Топ‑3: {standing.top3} / {standing.measured} · Топ‑10: {standing.top10} /{' '}
                {standing.measured}
            </span>
            <span>
                95% от топ‑1: {standing.close95} · 80–95%: {standing.close80}
            </span>
        </div>
    )
}

function RunEvidence({
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

function BenchmarkPassport({ benchmark }: Readonly<{ benchmark: ComparisonBenchmark }>) {
    const passport = comparisonPassports.get(benchmark.id)
    return (
        <details className="benchmark-passport">
            <summary>
                {benchmark.name}
                <span>{benchmark.context}</span>
            </summary>
            <p>
                Единицы: {benchmark.unit}.{' '}
                {benchmark.awardEligible
                    ? 'Участвует в медалях при наличии минимум двух измеренных моделей.'
                    : 'Не участвует в медалях: составной индекс, дополнительная метрика или предыдущая версия теста.'}
            </p>
            {passport ? (
                <>
                    <p>
                        {passport.purpose} Автор: {passport.author}.
                    </p>
                    <p>
                        {passport.requirements} {passport.scoring}
                    </p>
                    <dl className="review-list">
                        {passport.reviews.map((review) => (
                            <div key={review.dimension}>
                                <dt>
                                    {dimensions.get(review.dimension)}{' '}
                                    <span>{statuses.get(review.status)}</span>
                                </dt>
                                <dd>
                                    {review.explanation} <a href={review.sourceUrl}>Основание</a> ·{' '}
                                    <time dateTime={review.checkedAt}>
                                        {dateFormat.format(new Date(review.checkedAt))}
                                    </time>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </>
            ) : (
                <p>
                    Полный разбор этого протокола ещё не выполнен. Независимость, насыщение, риск
                    утечки и воспроизводимость не оценены. Неуказанная версия остаётся неизвестной.
                </p>
            )}
            <p>
                <a href={benchmark.methodologyUrl}>Методология</a> ·{' '}
                <a href={benchmark.sourceUrl}>Результаты источника</a> · Проверено{' '}
                <time dateTime={benchmark.checkedAt}>
                    {dateFormat.format(new Date(benchmark.checkedAt))}
                </time>
            </p>
        </details>
    )
}

function ResultDetails({
    cell,
    benchmark,
    modelName,
    override,
    onSelect,
    onClose,
}: Readonly<{
    cell: ComparisonCell
    benchmark: ComparisonBenchmark
    modelName: string
    override: string | undefined
    onSelect: (id: string) => void
    onClose: () => void
}>) {
    return (
        <div className="comparison-detail">
            <div className="section-heading">
                <h3>
                    {modelName} · {benchmark.name}
                </h3>
                <button type="button" className="show-more" onClick={onClose}>
                    Закрыть запуски
                </button>
            </div>
            <p>
                {benchmark.context}. Диапазон {scoreText(cell.min, benchmark)}–
                {scoreText(cell.max, benchmark)} — минимум и максимум опубликованных конфигураций.
                Это не доверительный интервал.
            </p>
            <div className="kind-field">
                <label htmlFor="cell-configuration">
                    Конфигурация для места и сортировки этой ячейки
                </label>
                <select
                    id="cell-configuration"
                    value={override ?? 'automatic'}
                    onChange={(event) => {
                        onSelect(event.target.value)
                    }}
                >
                    <option value="automatic">По общему режиму таблицы</option>
                    {cell.runs.map((run) => (
                        <option key={run.id} value={run.id}>
                            {run.label} — {scoreText(run.score, benchmark)}
                        </option>
                    ))}
                </select>
            </div>
            <p className="catalog-footnote">
                Настройки запуска сохраняются отдельно. Диапазоны двух разных протоколов не
                объединяются. Места рассчитываются по точным исходным значениям до округления.
            </p>
            <ul className="run-evidence-list">
                {cell.runs.map((run) => (
                    <RunEvidence key={run.id} run={run} benchmark={benchmark} />
                ))}
            </ul>
        </div>
    )
}

export function ComparisonSection() {
    const scroll = useRef<HTMLDivElement>(null)
    const activeCell = useRef<HTMLButtonElement>(null)
    const [query, setQuery] = useState('')
    const [vendor, setVendor] = useState('all')
    const [columns, setColumns] = useState(defaults)
    const [benchmarkQuery, setBenchmarkQuery] = useState('')
    const [sort, setSort] = useState('medals')
    const [direction, setDirection] = useState<'ascending' | 'descending'>('descending')
    const [mode, setMode] = useState<ResultMode>('best')
    const [limit, setLimit] = useState(10)
    const [selections, setSelections] = useState(new Map<string, string>())
    const [expanded, setExpanded] = useState<{ modelId: string; benchmarkId: string }>()
    const visibleBenchmarks = comparisonBenchmarks.filter((benchmark) =>
        columns.includes(benchmark.id),
    )
    const standings = useMemo(
        () =>
            comparisonStandings(
                comparisonCatalog.models,
                comparisonBenchmarks,
                comparisonRuns,
                columns,
                selections,
                mode,
            ),
        [columns, selections, mode],
    )
    const normalizedQuery = query.trim().toLocaleLowerCase('ru')
    const rows = sortStandings(standings, sort, direction).filter(
        (standing) =>
            (vendor === 'all' || standing.model.vendor === vendor) &&
            `${standing.model.name} ${standing.model.vendor}`
                .toLocaleLowerCase('ru')
                .includes(normalizedQuery),
    )
    const vendors = [...new Set(comparisonCatalog.models.map((model) => model.vendor))].toSorted(
        (a, b) => a.localeCompare(b),
    )
    const awardCount = visibleBenchmarks.filter(
        (benchmark) =>
            benchmark.awardEligible &&
            standings.some((standing) => (standing.cells.get(benchmark.id)?.cohort ?? 0) >= 2),
    ).length
    const sortBenchmark = comparisonBenchmarks.find((benchmark) => benchmark.id === sort)

    const normalizedBenchmarkQuery = benchmarkQuery.trim().toLocaleLowerCase('ru')
    const filteredBenchmarks = comparisonBenchmarks.filter((benchmark) =>
        `${benchmark.name} ${benchmark.context}`
            .toLocaleLowerCase('ru')
            .includes(normalizedBenchmarkQuery),
    )

    function sortSuffix(metric: string) {
        if (sort !== metric) return ''
        return direction === 'descending' ? ' ↓' : ' ↑'
    }

    function chooseSort(metric: string) {
        setSort(metric)
        setDirection(metric === sort && direction === 'descending' ? 'ascending' : 'descending')
        setLimit(10)
        if (
            !['medals', 'top3', 'top10', 'close95', 'close80'].includes(metric) &&
            !columns.includes(metric)
        )
            setColumns([...columns, metric])
    }

    function toggleColumn(id: string, checked: boolean) {
        setColumns(checked ? [...columns, id] : columns.filter((column) => column !== id))
        if (!checked && sort === id) {
            setSort('medals')
            setDirection('descending')
        }
        if (!checked && expanded?.benchmarkId === id) setExpanded(undefined)
        setLimit(10)
    }

    return (
        <section
            className="benchmarks-section comparison-section wrap"
            id="benchmarks"
            aria-labelledby="comparison-title"
        >
            <div className="section-heading">
                <div>
                    <h2 id="comparison-title">Модели в одной таблице</h2>
                    <p>Выберите тесты, сравните диапазоны и места.</p>
                </div>
                <a className="text-link" href="#comparison-rules">
                    Как считаем рейтинг
                </a>
            </div>
            <p className="benchmark-context">
                Одна строка — одна версия модели. Результаты источников собраны вместе; версия теста
                и протокол указаны в столбцах. Нажмите результат, чтобы выбрать запуск и увидеть
                источники.
            </p>
            <div className="catalog-tools comparison-tools">
                <div className="search-field">
                    <label htmlFor="comparison-query">Найти модель</label>
                    <input
                        id="comparison-query"
                        type="search"
                        placeholder="Например, GLM или Composer"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value)
                            setLimit(10)
                        }}
                    />
                </div>
                <div className="kind-field">
                    <label htmlFor="comparison-vendor">Разработчик</label>
                    <select
                        id="comparison-vendor"
                        value={vendor}
                        onChange={(event) => {
                            setVendor(event.target.value)
                            setLimit(10)
                        }}
                    >
                        <option value="all">Все разработчики</option>
                        {vendors.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="kind-field">
                    <label htmlFor="comparison-mode">Результат для рейтинга</label>
                    <select
                        id="comparison-mode"
                        value={mode}
                        onChange={(event) => {
                            setMode(event.target.value === 'minimum' ? 'minimum' : 'best')
                            setLimit(10)
                        }}
                    >
                        <option value="best">Лучший опубликованный</option>
                        <option value="minimum">Минимум опубликованных</option>
                    </select>
                </div>
                <div className="kind-field">
                    <label htmlFor="comparison-sort">Сортировать по</label>
                    <select
                        id="comparison-sort"
                        value={sort}
                        onChange={(event) => {
                            chooseSort(event.target.value)
                        }}
                    >
                        <option value="medals">Медалям</option>
                        <option value="top3">Попаданиям в топ‑3</option>
                        <option value="top10">Попаданиям в топ‑10</option>
                        <option value="close95">Близости 95% к топ‑1</option>
                        <option value="close80">Близости 80–95% к топ‑1</option>
                        {comparisonBenchmarks.map((benchmark) => (
                            <option key={benchmark.id} value={benchmark.id}>
                                {benchmark.name} · {benchmark.context}
                            </option>
                        ))}
                    </select>
                    {sortBenchmark && (
                        <p className="sort-context">
                            {sortBenchmark.name} · {sortBenchmark.context}
                        </p>
                    )}
                </div>
            </div>
            <details className="column-picker">
                <summary>
                    Выбрать бенчмарки · включено {columns.length} из {comparisonBenchmarks.length}
                </summary>
                <div className="search-field benchmark-search">
                    <label htmlFor="benchmark-query">Поиск бенчмарка</label>
                    <input
                        id="benchmark-query"
                        type="search"
                        placeholder="Например, Terminal или GPQA"
                        value={benchmarkQuery}
                        onChange={(event) => {
                            setBenchmarkQuery(event.target.value)
                        }}
                    />
                </div>
                <div className="picker-actions" role="group" aria-label="Массовый выбор бенчмарков">
                    <button
                        type="button"
                        className="show-more"
                        onClick={() => {
                            setColumns(filteredBenchmarks.map((benchmark) => benchmark.id))
                            setLimit(10)
                        }}
                    >
                        Выбрать все
                        {benchmarkQuery.trim()
                            ? ` (${filteredBenchmarks.length.toString()})`
                            : ` (${comparisonBenchmarks.length.toString()})`}
                    </button>
                    <button
                        type="button"
                        className="show-more"
                        onClick={() => {
                            setColumns(
                                columns.filter(
                                    (id) =>
                                        !filteredBenchmarks.some(
                                            (benchmark) => benchmark.id === id,
                                        ),
                                ),
                            )
                            setLimit(10)
                        }}
                    >
                        Снять все
                        {benchmarkQuery.trim() ? ` (${filteredBenchmarks.length.toString()})` : ''}
                    </button>
                    <button
                        type="button"
                        className="show-more"
                        onClick={() => {
                            setColumns(
                                comparisonBenchmarks
                                    .filter((benchmark) => benchmark.awardEligible)
                                    .map((benchmark) => benchmark.id),
                            )
                            setLimit(10)
                        }}
                    >
                        Только с медалями
                    </button>
                </div>
                <fieldset>
                    <legend>Выбранные тесты определяют столбцы и медали</legend>
                    {filteredBenchmarks.length > 0 ? (
                        filteredBenchmarks.map((benchmark) => (
                            <label key={benchmark.id}>
                                <input
                                    type="checkbox"
                                    checked={columns.includes(benchmark.id)}
                                    onChange={(event) => {
                                        toggleColumn(benchmark.id, event.target.checked)
                                    }}
                                />
                                <span>
                                    {benchmark.name}
                                    <small>
                                        {benchmark.context}
                                        {benchmark.awardEligible ? '' : ' · без медалей'}
                                    </small>
                                </span>
                            </label>
                        ))
                    ) : (
                        <p className="catalog-footnote">
                            По запросу «{benchmarkQuery.trim()}» ничего не найдено. Измените запрос
                            или{' '}
                            <button
                                type="button"
                                className="inline-action"
                                onClick={() => {
                                    setBenchmarkQuery('')
                                }}
                            >
                                покажите все бенчмарки
                            </button>
                            .
                        </p>
                    )}
                </fieldset>
                <button
                    type="button"
                    className="show-more"
                    onClick={() => {
                        setColumns(defaults)
                        setSort('medals')
                        setDirection('descending')
                        setBenchmarkQuery('')
                        setLimit(10)
                    }}
                >
                    Вернуть начальные бенчмарки
                </button>
            </details>
            <p className="result-count" role="status">
                Показано {Math.min(limit, rows.length)} из {rows.length} моделей · В медалях:{' '}
                {awardCount} выбранных тестов и протоколов
            </p>
            {selections.size > 0 && (
                <p className="catalog-footnote">
                    Выбраны отдельные конфигурации: {selections.size}.{' '}
                    <button
                        type="button"
                        className="inline-action"
                        onClick={() => {
                            setSelections(new Map())
                        }}
                    >
                        Вернуть общий режим для всех ячеек
                    </button>
                </p>
            )}
            {rows.length > 0 ? (
                <>
                    <div className="overflow-controls" aria-label="Прокрутка таблицы">
                        <button
                            type="button"
                            aria-controls="comparison-scroll"
                            onClick={() => {
                                scroll.current?.scrollBy({ left: -360 })
                            }}
                        >
                            Влево
                        </button>
                        <button
                            type="button"
                            aria-controls="comparison-scroll"
                            onClick={() => {
                                scroll.current?.scrollBy({ left: 360 })
                            }}
                        >
                            Вправо
                        </button>
                        <span>Нажмите заголовок столбца, чтобы изменить порядок.</span>
                    </div>
                    <div
                        className="benchmark-table-scroll"
                        id="comparison-scroll"
                        ref={scroll}
                        role="region"
                        aria-label="Общая таблица моделей с горизонтальной прокруткой"
                    >
                        <table className="benchmark-table comparison-table">
                            <caption>
                                {mode === 'best'
                                    ? 'Места по лучшим опубликованным запускам'
                                    : 'Места по минимуму опубликованных запусков'}
                                . Диапазон — разброс конфигураций; пропуски остаются без оценки.
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col">Модель</th>
                                    <th
                                        scope="col"
                                        aria-sort={
                                            ['medals', 'top3', 'top10'].includes(sort)
                                                ? direction
                                                : 'none'
                                        }
                                    >
                                        <button
                                            type="button"
                                            className="table-sort"
                                            onClick={() => {
                                                chooseSort('medals')
                                            }}
                                        >
                                            Медали
                                            {sortSuffix('medals')}
                                        </button>
                                        <div className="achievement-sorts">
                                            <button
                                                type="button"
                                                aria-pressed={sort === 'top3'}
                                                onClick={() => {
                                                    chooseSort('top3')
                                                }}
                                            >
                                                Топ‑3
                                            </button>
                                            <button
                                                type="button"
                                                aria-pressed={sort === 'top10'}
                                                onClick={() => {
                                                    chooseSort('top10')
                                                }}
                                            >
                                                Топ‑10
                                            </button>
                                        </div>
                                    </th>
                                    {visibleBenchmarks.map((benchmark) => (
                                        <th
                                            key={benchmark.id}
                                            scope="col"
                                            aria-sort={sort === benchmark.id ? direction : 'none'}
                                        >
                                            <button
                                                className="table-sort"
                                                type="button"
                                                onClick={() => {
                                                    chooseSort(benchmark.id)
                                                }}
                                            >
                                                {benchmark.name}
                                                {sortSuffix(benchmark.id)}
                                            </button>
                                            <span className="metric-unit">
                                                {benchmark.context} · {benchmark.unit}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            {rows.slice(0, limit).map((standing) => {
                                const definition = comparisonCatalog.models.find(
                                    (model) => model.id === standing.model.id,
                                )
                                const expandedBenchmark =
                                    expanded?.modelId === standing.model.id
                                        ? visibleBenchmarks.find(
                                              (benchmark) => benchmark.id === expanded.benchmarkId,
                                          )
                                        : undefined
                                const expandedCell = expandedBenchmark
                                    ? standing.cells.get(expandedBenchmark.id)
                                    : undefined
                                return (
                                    <tbody key={standing.model.id} data-model={standing.model.id}>
                                        <tr>
                                            <th scope="row">
                                                <a
                                                    className="model-name model-link"
                                                    href={`#model/${standing.model.id}`}
                                                >
                                                    {standing.model.name}
                                                </a>
                                                <span className="agent-name">
                                                    {standing.model.vendor}
                                                </span>
                                                {definition?.status === 'requested-unconfirmed' && (
                                                    <span className="availability-note">
                                                        Точная версия пока не подтверждена
                                                    </span>
                                                )}
                                                <details className="model-origin">
                                                    <summary>Версия и охват</summary>
                                                    <p>{definition?.note}</p>
                                                    {definition?.evidence && (
                                                        <p>
                                                            <a href={definition.evidence.url}>
                                                                Основание выбора версии
                                                            </a>{' '}
                                                            ·{' '}
                                                            <time
                                                                dateTime={
                                                                    definition.evidence.checkedAt
                                                                }
                                                            >
                                                                {dateFormat.format(
                                                                    new Date(
                                                                        definition.evidence
                                                                            .checkedAt,
                                                                    ),
                                                                )}
                                                            </time>
                                                        </p>
                                                    )}
                                                </details>
                                            </th>
                                            <td>
                                                <Achievements standing={standing} />
                                            </td>
                                            {visibleBenchmarks.map((benchmark) => {
                                                const cell = standing.cells.get(benchmark.id)
                                                const selected = cell?.selected
                                                const isOpen =
                                                    expanded?.modelId === standing.model.id &&
                                                    expanded.benchmarkId === benchmark.id
                                                return (
                                                    <td
                                                        key={benchmark.id}
                                                        className={
                                                            sort === benchmark.id
                                                                ? 'selected-score'
                                                                : ''
                                                        }
                                                    >
                                                        {cell && selected ? (
                                                            <button
                                                                type="button"
                                                                className="result-cell"
                                                                aria-label={`${standing.model.name}, ${benchmark.name}, ${benchmark.context}, ${scoreText(selected.score, benchmark)}. Показать запуски`}
                                                                aria-expanded={isOpen}
                                                                onClick={(event) => {
                                                                    activeCell.current =
                                                                        event.currentTarget
                                                                    setExpanded(
                                                                        isOpen
                                                                            ? undefined
                                                                            : {
                                                                                  modelId:
                                                                                      standing.model
                                                                                          .id,
                                                                                  benchmarkId:
                                                                                      benchmark.id,
                                                                              },
                                                                    )
                                                                }}
                                                            >
                                                                <strong>
                                                                    {scoreText(
                                                                        selected.score,
                                                                        benchmark,
                                                                    )}
                                                                    {selected.estimated ? ' ≈' : ''}
                                                                </strong>
                                                                <span className="cell-place">
                                                                    {cell.rank
                                                                        ? `№${cell.rank.toString()} из ${cell.cohort.toString()}`
                                                                        : 'Место не присвоено'}
                                                                </span>
                                                                <span className="cell-range">
                                                                    {cell.runs.length > 1
                                                                        ? `${scoreText(cell.min, benchmark)}–${scoreText(cell.max, benchmark)} · ${cell.runs.length.toString()} конф.`
                                                                        : 'Одна конфигурация'}
                                                                </span>
                                                                {selections.has(
                                                                    selectionKey(
                                                                        standing.model.id,
                                                                        benchmark.id,
                                                                    ),
                                                                ) && (
                                                                    <span className="cell-place">
                                                                        Выбран отдельный запуск
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <span className="missing-score">
                                                                Нет данных
                                                            </span>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                        {expandedCell && expandedBenchmark && (
                                            <tr>
                                                <td colSpan={2 + visibleBenchmarks.length}>
                                                    <ResultDetails
                                                        cell={expandedCell}
                                                        benchmark={expandedBenchmark}
                                                        modelName={standing.model.name}
                                                        override={selections.get(
                                                            selectionKey(
                                                                standing.model.id,
                                                                expandedBenchmark.id,
                                                            ),
                                                        )}
                                                        onClose={() => {
                                                            setExpanded(undefined)
                                                            activeCell.current?.focus()
                                                        }}
                                                        onSelect={(id) => {
                                                            const next = new Map(selections)
                                                            const key = selectionKey(
                                                                standing.model.id,
                                                                expandedBenchmark.id,
                                                            )
                                                            if (id === 'automatic') next.delete(key)
                                                            else next.set(key, id)
                                                            setSelections(next)
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                )
                            })}
                        </table>
                    </div>
                </>
            ) : (
                <div className="empty-state benchmark-empty">
                    <h3>Модели не найдены</h3>
                    <p>
                        Измените запрос или разработчика. Отсутствие измерений не считается нулевым
                        результатом.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setQuery('')
                            setVendor('all')
                            setLimit(10)
                        }}
                    >
                        Сбросить фильтры
                    </button>
                </div>
            )}
            {rows.length > limit && (
                <button
                    className="show-more"
                    type="button"
                    onClick={() => {
                        setLimit(limit + 10)
                    }}
                >
                    Показать ещё {Math.min(10, rows.length - limit)}
                </button>
            )}
            <details className="comparison-rules" id="comparison-rules">
                <summary>Как считаем диапазоны, места и медали</summary>
                <p>
                    По умолчанию для каждого теста берём лучший опубликованный запуск модели. Можно
                    переключиться на минимум или выбрать точную конфигурацию в ячейке. Это разные
                    бюджеты и настройки; одинаковый effort у разных инструментов не означает
                    одинаковых условий.
                </p>
                <p>
                    Диапазон показывает минимум–максимум внутри одного столбца, включая разные
                    effort и опубликованные настройки. Он не описывает статистическую погрешность.
                    Диапазоны разных версий теста и протоколов не объединяются.
                </p>
                <p>
                    Места рассчитаны среди измеренных моделей редакционного каталога до поиска,
                    фильтра разработчика и ограничения строк. Это места Vibe Atlas, а не исходные
                    места сайта. Равные точные результаты делят место: 1, 1, 3.
                </p>
                <p>
                    Золото — место 1, серебро — 2, бронза — 3. Топ‑3 и топ‑10 включают первые места.
                    У каждого теста и протокола одна награда на модель; дополнительные effort не
                    умножают медали. Пропуски и оценочные значения не получают мест. При одной
                    измеренной модели награды не выдаются.
                </p>
                <p>
                    Медали считаются по выбранным столбцам. Составные индексы, дополнительные
                    показатели AA‑Omniscience и предыдущий CursorBench 3.1 исключены из наград. Один
                    тест в разных протоколах имеет отдельные столбцы и может дать несколько наград:
                    это прямо отражено в числе «тестов и протоколов». Полный аудит сопоставимости
                    ещё предстоит.
                </p>
                <p>
                    Близость к лидеру считается отдельно от медалей: 95%+ от лучшего измеренного
                    результата столбца и полоса 80–95%. Оценочные значения не участвуют, при нулевом
                    топе полосы не выдаются. Полосы действуют в тех же выбранных столбцах, что и
                    медали, и тоже требуют минимум две измеренные модели.
                </p>
                <p>
                    Рейтинг по медалям: сначала золото, затем серебро и бронза. Охват измерений
                    показан рядом с топами; модели с разным охватом не обязательно сопоставимы.
                    Порядок при полном равенстве — по названию.
                </p>
            </details>
            <details className="comparison-rules">
                <summary>Какие модели включены и где исходные данные</summary>
                <p>
                    Таблица использует явный редакционный список версий в изученном охвате. Все
                    строки исходных рейтингов автоматически в него не попадают. Сверка последних
                    версий каждой линейки по первоисточникам вендоров ещё не завершена.
                </p>
                <p>
                    Запрошенные GPT‑6.1 Luna, MiniMax‑M3.1‑Flash‑Preview и Muse Spark 1.3
                    Contributor остаются отдельными позициями без присвоенных чужих результатов.
                    Предыдущие поколения сохранены в исходных снимках.
                </p>
                <p>
                    Полные результаты:{' '}
                    <a href={analysisDownloadUrl} download>
                        AA Coding Agents JSON
                    </a>{' '}
                    ·{' '}
                    <a href={modelsDownloadUrl} download>
                        AA Models JSON
                    </a>{' '}
                    ·{' '}
                    <a href={cursorDownloadUrl} download>
                        Cursor JSON
                    </a>{' '}
                    ·{' '}
                    <a href={packsDownloadUrl} download>
                        Дополнительные бенчмарки JSON
                    </a>
                    .
                </p>
            </details>
            <div className="benchmark-methodology" id="benchmark-methodology">
                <h3>Методология всех бенчмарков</h3>
                <p className="catalog-footnote">
                    Паспорта и ограничения относятся к версии теста и протоколу запуска. Показаны
                    все {comparisonBenchmarks.length} тестов и протоколов таблицы, включая
                    невыбранные столбцы.
                </p>
                {comparisonBenchmarks.map((benchmark) => (
                    <BenchmarkPassport key={benchmark.id} benchmark={benchmark} />
                ))}
            </div>
        </section>
    )
}
