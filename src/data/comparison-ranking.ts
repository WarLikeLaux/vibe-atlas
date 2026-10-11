export interface ComparisonRun {
    id: string
    modelId: string
    benchmarkId: string
    label: string
    score: number
    sourceUrl: string
    checkedAt: string
    notes: string[]
    telemetry: { name: string; value: number; unit: string }[]
    estimated: boolean
}

export interface ComparisonBenchmark {
    id: string
    name: string
    context: string
    unit: string
    format: 'percent' | 'number'
    awardEligible: boolean
    sourceUrl: string
    methodologyUrl: string
    checkedAt: string
}

export interface ComparisonModel {
    id: string
    name: string
    vendor: string
}

export interface ComparisonCell {
    runs: ComparisonRun[]
    selected: ComparisonRun | undefined
    min: number | undefined
    max: number | undefined
    rank: number | undefined
    cohort: number
}

export interface ComparisonStanding {
    model: ComparisonModel
    cells: Map<string, ComparisonCell>
    medals: { gold: number; silver: number; bronze: number }
    top3: number
    top10: number
    close95: number
    close80: number
    measured: number
}

export type ResultMode = 'best' | 'minimum'

export function selectionKey(modelId: string, benchmarkId: string) {
    return `${modelId}:${benchmarkId}`
}

function makeCell(
    runs: ComparisonRun[],
    selectedId: string | undefined,
    mode: ResultMode,
): ComparisonCell {
    const ordered = runs.toSorted((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    const chosen = selectedId ? ordered.find((run) => run.id === selectedId) : undefined
    return {
        runs: ordered,
        selected: chosen ?? (mode === 'best' ? ordered.at(0) : ordered.at(-1)),
        min: ordered.at(-1)?.score,
        max: ordered.at(0)?.score,
        rank: undefined,
        cohort: 0,
    } satisfies ComparisonCell
}

function rankCells(standings: ComparisonStanding[], benchmarkId: string) {
    const cells = standings.flatMap((standing) => {
        const cell = standing.cells.get(benchmarkId)
        return cell?.selected ? [cell] : []
    })
    const values = cells.flatMap((cell) =>
        cell.selected && !cell.selected.estimated ? [cell.selected.score] : [],
    )
    for (const cell of cells) {
        cell.cohort = values.length
        if (cell.selected && !cell.selected.estimated) {
            const selectedScore = cell.selected.score
            // Competition ranking: 1, 1, 3. Missing values and estimates do not rank.
            cell.rank = 1 + values.filter((score) => score > selectedScore).length
        }
    }
    return values.length
}

function proximityTop(standings: ComparisonStanding[], benchmarkId: string) {
    const scores = standings.flatMap((standing) => {
        const selected = standing.cells.get(benchmarkId)?.selected
        return selected && !selected.estimated ? [selected.score] : []
    })
    return scores.length > 0 ? Math.max(...scores) : 0
}

function awardProximity(standing: ComparisonStanding, benchmarkId: string, top: number) {
    // Proximity bands against the best measured score: 95%+ and 80–95%.
    // Estimates never qualify; a zero top score disables the bands.
    const selected = standing.cells.get(benchmarkId)?.selected
    if (top > 0 && selected && !selected.estimated) {
        const ratio = selected.score / top
        if (ratio >= 0.95) standing.close95++
        else if (ratio >= 0.8) standing.close80++
    }
}

function awardPlaces(standings: ComparisonStanding[], benchmarkId: string) {
    const top = proximityTop(standings, benchmarkId)
    for (const standing of standings) {
        const rank = standing.cells.get(benchmarkId)?.rank
        if (rank === undefined) continue
        standing.measured++
        if (rank === 1) standing.medals.gold++
        if (rank === 2) standing.medals.silver++
        if (rank === 3) standing.medals.bronze++
        if (rank <= 3) standing.top3++
        if (rank <= 10) standing.top10++
        awardProximity(standing, benchmarkId, top)
    }
}

function sortValue(standing: ComparisonStanding, metric: string) {
    if (metric === 'top3') return standing.top3
    if (metric === 'top10') return standing.top10
    if (metric === 'close95') return standing.close95
    if (metric === 'close80') return standing.close80
    return standing.cells.get(metric)?.selected?.score
}

/** Rank the full editorial cohort before search, provider filters and pagination. */
export function comparisonStandings(
    models: ComparisonModel[],
    benchmarks: ComparisonBenchmark[],
    runs: ComparisonRun[],
    awardIds: string[],
    selections: ReadonlyMap<string, string>,
    mode: ResultMode,
): ComparisonStanding[] {
    const grouped = new Map<string, ComparisonRun[]>()
    // A repeated publication of the same normalized run cannot create another entry.
    for (const run of new Map(runs.map((entry) => [entry.id, entry])).values()) {
        const key = selectionKey(run.modelId, run.benchmarkId)
        const group = grouped.get(key) ?? []
        group.push(run)
        grouped.set(key, group)
    }
    const standings: ComparisonStanding[] = models.map((model) => ({
        model,
        cells: new Map(
            benchmarks.map((benchmark) => {
                const key = selectionKey(model.id, benchmark.id)
                return [benchmark.id, makeCell(grouped.get(key) ?? [], selections.get(key), mode)]
            }),
        ),
        medals: { gold: 0, silver: 0, bronze: 0 },
        top3: 0,
        top10: 0,
        close95: 0,
        close80: 0,
        measured: 0,
    }))
    for (const benchmark of benchmarks) {
        const cohort = rankCells(standings, benchmark.id)
        if (benchmark.awardEligible && awardIds.includes(benchmark.id) && cohort >= 2) {
            awardPlaces(standings, benchmark.id)
        }
    }
    return standings
}

export function sortStandings(
    standings: ComparisonStanding[],
    metric: string,
    direction: 'ascending' | 'descending',
) {
    return standings.toSorted((a, b) => {
        if (metric === 'medals') {
            const order =
                b.medals.gold - a.medals.gold ||
                b.medals.silver - a.medals.silver ||
                b.medals.bronze - a.medals.bronze
            return (
                (direction === 'descending' ? order : -order) ||
                a.model.name.localeCompare(b.model.name)
            )
        }
        const aScore = sortValue(a, metric)
        const bScore = sortValue(b, metric)
        if (aScore === undefined)
            return bScore === undefined ? a.model.name.localeCompare(b.model.name) : 1
        if (bScore === undefined) return -1
        return (
            (direction === 'descending' ? bScore - aScore : aScore - bScore) ||
            a.model.name.localeCompare(b.model.name)
        )
    })
}
