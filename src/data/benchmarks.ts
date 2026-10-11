import analysisData from '../../data/artificial-analysis.json' with { type: 'json' }
import definitionsData from '../../data/benchmark-definitions.json' with { type: 'json' }

import { analysisSchema, benchmarkDefinitionsSchema, validateAnalysis } from './benchmark-schema.ts'

export const analysis = analysisSchema.parse(analysisData)
export const benchmarkDefinitions = benchmarkDefinitionsSchema.parse(definitionsData)
validateAnalysis(analysis)

export const telemetryLabels = new Map([
    ['reward', ['Результат', 'доля']],
    ['costUsd', ['Расход API', 'USD / попытку']],
    ['agentWallTimeSec', ['Время агента', 'с / попытку']],
    ['steps', ['Шаги', 'шагов / попытку']],
    ['inputTokens', ['Входные токены', 'токенов / попытку']],
    ['outputTokens', ['Выходные токены', 'токенов / попытку']],
    ['cacheTokens', ['Токены кеша', 'токенов / попытку']],
    ['cacheHitRate', ['Попадания в кеш', 'доля']],
    ['totalTokens', ['Всего токенов', 'токенов / попытку']],
])

export function formatNumber(value: number | null | undefined, maximumFractionDigits = 2) {
    return value === null || value === undefined
        ? 'Нет данных'
        : new Intl.NumberFormat('ru', { maximumFractionDigits }).format(value)
}
