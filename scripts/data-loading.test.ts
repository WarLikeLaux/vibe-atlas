import assert from 'node:assert/strict'
import { test } from 'node:test'

await test('every UI data module parses its published JSON', async () => {
    const modules = [
        '../src/data/benchmarks.ts',
        '../src/data/benchmark-packs.ts',
        '../src/data/catalog.ts',
        '../src/data/comparison.ts',
        '../src/data/cursor.ts',
        '../src/data/experience.ts',
        '../src/data/guide.ts',
        '../src/data/model-schema.ts',
        '../src/data/models.ts',
    ]
    for (const specifier of modules) {
        await assert.doesNotReject(import(specifier), `parses: ${specifier}`)
    }
})
