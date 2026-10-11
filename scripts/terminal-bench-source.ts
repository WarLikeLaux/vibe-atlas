import { z } from 'zod'

import { packSchema, passportSchema } from '../src/data/benchmark-pack-schema.ts'

const link = z.looseObject({ label: z.string().min(1), url: z.url({ protocol: /^https$/ }) })
const percent = z.number().min(0).max(100)
const nonnegative = z.number().nonnegative()
export const terminalSourceSchema = z.looseObject({
    leaderboard: z.looseObject({
        id: z.string().min(1),
        package: z.literal('terminal-bench/terminal-bench'),
        name: z.literal('4-0-0'),
        title: z.literal('Terminal-Bench 4.0'),
        visibility: z.literal('public'),
        dataset_version_ids: z.array(z.string().min(1)).min(1),
        rank_by: z
            .array(
                z.strictObject({
                    accessor: z.literal('metrics.accuracy'),
                    direction: z.literal('desc'),
                }),
            )
            .length(1),
    }),
    rows: z
        .array(
            z.looseObject({
                id: z.string().min(1),
                leaderboard_id: z.string().min(1),
                status: z.literal('display'),
                rank: z.number().int().positive(),
                metadata: z.looseObject({
                    model_display: link,
                    agent_display: link,
                    reasoning_effort: z.string(),
                    date: z.iso.date(),
                }),
                metrics: z.looseObject({
                    accuracy: percent,
                    accuracy_ci95_half_width: percent,
                    n_trials: z.number().int().positive(),
                    total_tokens: nonnegative,
                    total_cost_usd: nonnegative,
                    output_tokens: nonnegative.optional(),
                    cached_input_tokens: nonnegative.optional(),
                    uncached_input_tokens: nonnegative.optional(),
                    avg_trial_duration_sec: nonnegative.optional(),
                    pass_at_2: z.number().min(0).max(1).optional(),
                    pass_at_3: z.number().min(0).max(1).optional(),
                    pass_at_4: z.number().min(0).max(1).optional(),
                    pass_at_5: z.number().min(0).max(1).optional(),
                }),
                n_trials: z.number().int().positive(),
            }),
        )
        .min(1),
})

export const terminalDefinitionSchema = z.strictObject({
    version: z.literal(1),
    modelAliases: z.record(z.string(), z.string().min(1)),
    protocols: z.array(z.strictObject({ id: z.string().min(1), agent: z.string().min(1) })).min(1),
    passport: passportSchema,
})
type TerminalSource = z.infer<typeof terminalSourceSchema>
type TerminalDefinition = z.infer<typeof terminalDefinitionSchema>

const metrics = new Map([
    ['n_trials', ['Попытки', 'попыток, всего']],
    [
        'accuracy_ci95_half_width',
        ['Полуширина 95% доверительного интервала', 'процентных пунктов; не диапазон конфигураций'],
    ],
    ['total_tokens', ['Токены', 'токенов, всего по запуску']],
    ['total_cost_usd', ['Стоимость', 'USD, всего по запуску']],
    ['output_tokens', ['Выходные токены', 'токенов, всего']],
    ['cached_input_tokens', ['Кэшированные входные токены', 'токенов, поле источника']],
    ['uncached_input_tokens', ['Некэшированные входные токены', 'токенов, поле источника']],
    ['avg_trial_duration_sec', ['Длительность попытки', 'секунд, среднее']],
    ['pass_at_2', ['pass@2', 'доля 0–1']],
    ['pass_at_3', ['pass@3', 'доля 0–1']],
    ['pass_at_4', ['pass@4', 'доля 0–1']],
    ['pass_at_5', ['pass@5', 'доля 0–1']],
])

export function terminalPack(
    source: TerminalSource,
    definition: TerminalDefinition,
    checkedAt: string,
    snapshotSha256: string,
) {
    if (new Set(source.rows.map((row) => row.id)).size !== source.rows.length)
        throw new Error('Duplicate Terminal-Bench run identifiers')
    const aliases = new Map(Object.entries(definition.modelAliases))
    const protocols = new Map(definition.protocols.map((protocol) => [protocol.agent, protocol.id]))
    return packSchema.parse({
        id: 'terminal-bench-4.0',
        sourceId: 'terminal-bench',
        checkedAt,
        parserVersion: 'terminal-bench/1',
        snapshotPath: 'data/snapshots/terminal-bench/current.json',
        snapshotSha256,
        benchmarks: definition.protocols.map((protocol) => ({
            id: `terminal:${protocol.id}`,
            name: 'Terminal-Bench 4.0',
            context: `Официальный · ${protocol.agent}`,
            unit: '% accuracy',
            format: 'percent',
            awardEligible: true,
            sourceUrl: 'https://www.tbench.ai/',
            methodologyUrl: 'https://www.tbench.ai/news/terminal-bench-4-0',
            checkedAt,
            passport: {
                ...definition.passport,
                requirements: `${definition.passport.requirements} Агент: ${protocol.agent}; точная версия агента в таблице не раскрыта.`,
            },
        })),
        runs: source.rows.map((row) => {
            const protocol = protocols.get(row.metadata.agent_display.label)
            if (!protocol) throw new Error('Unknown Terminal-Bench agent; review its protocol')
            if (
                row.leaderboard_id !== source.leaderboard.id ||
                row.n_trials !== row.metrics.n_trials
            )
                throw new Error('Terminal-Bench run disagrees with leaderboard or trial count')
            const modelId = aliases.get(row.metadata.model_display.label)
            return {
                id: `terminal:${row.id}`,
                ...(modelId ? { modelId } : {}),
                sourceModelName: row.metadata.model_display.label,
                benchmarkId: `terminal:${protocol}`,
                label: `${row.metadata.model_display.label} · ${row.metadata.agent_display.label} · effort ${row.metadata.reasoning_effort || 'не раскрыт'}`,
                score: row.metrics.accuracy,
                sourceUrl: 'https://www.tbench.ai/',
                checkedAt,
                estimated: false,
                notes: [
                    `Идентификатор запуска: ${row.id}. Дата в поле metadata.date источника: ${row.metadata.date}.`,
                    'Официальный рейтинг Terminal-Bench; другой протокол относительно замеров AA. Версия агента и официальный API ID модели не подтверждены этим сопоставлением.',
                    `95% доверительный интервал: ±${row.metrics.accuracy_ci95_half_width.toString()} процентных пункта. Метод его расчёта ещё не проверен; он отличается от диапазона разных конфигураций.`,
                    'Стоимость и total_tokens — итоги всего запуска, не среднее на задачу. Аддитивность полей токенов не подтверждена; исходные числа сохранены отдельно.',
                ],
                telemetry: [...metrics].flatMap(([key, labels]) => {
                    const value = new Map(Object.entries(row.metrics)).get(key)
                    const [name, unit] = labels
                    return typeof value === 'number' && name && unit ? [{ name, value, unit }] : []
                }),
            }
        }),
    })
}
