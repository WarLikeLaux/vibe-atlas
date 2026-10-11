import sourceData from '../../data/cursor-benchmarks.json' with { type: 'json' }
import passportData from '../../data/cursor-passports.json' with { type: 'json' }

import {
    cursorAnalysisSchema,
    cursorPassportsSchema,
    validateCursorAnalysis,
} from './cursor-schema.ts'

export const cursorAnalysis = cursorAnalysisSchema.parse(sourceData)
export const cursorPassports = cursorPassportsSchema.parse(passportData)
validateCursorAnalysis(cursorAnalysis)
