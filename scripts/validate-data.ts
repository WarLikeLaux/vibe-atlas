import { catalog } from '../src/data/catalog.ts'

const identifiers = new Set(catalog.sources.map((source) => source.id))
if (identifiers.size !== catalog.sources.length) {
    throw new Error('Source identifiers must be unique')
}

console.info(`Validated ${catalog.sources.length.toString()} registered sources`)
