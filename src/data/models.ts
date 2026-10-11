import modelsData from '../../data/aa-models.json' with { type: 'json' }

import {
    modelAnalysisSchema,
    modelMetricRegistry,
    modelMetricValue,
    validateModelAnalysis,
} from './model-schema.ts'

export const modelAnalysis = modelAnalysisSchema.parse(modelsData)
validateModelAnalysis(modelAnalysis)
export const modelViews = modelAnalysis.rows.map((source) => ({
    source,
    metrics: new Map(
        modelMetricRegistry.metrics.map((metric) => [
            metric.key,
            modelMetricValue(source, metric.key),
        ]),
    ),
}))
