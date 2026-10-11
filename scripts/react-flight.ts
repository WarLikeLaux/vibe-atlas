import { z } from 'zod'

const jsonRecord = z.record(z.string(), z.unknown())

// React Flight references share objects between highlights and the complete table.
// Decode them as data; never evaluate JavaScript from the source page.
function flightRecords(html: string) {
    const chunks: string[] = []
    for (const match of html.matchAll(/self\.__next_f\.push\((.*?)\)<\/script>/gs)) {
        const payload = z.tuple([z.number(), z.string()]).safeParse(JSON.parse(match[1] ?? 'null'))
        if (payload.success) chunks.push(payload.data[1])
    }
    const records = new Map<string, unknown>()
    for (const line of chunks.join('').split('\n')) {
        const separator = line.indexOf(':')
        const content = line.slice(separator + 1)
        if (separator > 0 && (content.startsWith('[') || content.startsWith('{'))) {
            records.set(line.slice(0, separator), JSON.parse(content))
        }
    }
    return records
}

function resolveReference(reference: string, records: Map<string, unknown>) {
    const [recordId, ...path] = reference.slice(1).split(':')
    let target = records.get(recordId ?? '')
    for (const segment of path) {
        if (Array.isArray(target)) {
            const elements: unknown[] = target
            target = elements.at(segment === 'props' ? 3 : Number(segment))
        } else {
            target = new Map(Object.entries(jsonRecord.parse(target))).get(segment)
        }
    }
    if (target === undefined) throw new Error(`Unresolved Flight reference: ${reference}`)
    return target
}

function resolveFlight(value: unknown, records: Map<string, unknown>, depth = 0): unknown {
    if (depth > 80) throw new Error('Circular or excessively nested Flight reference')
    if (typeof value === 'string' && /^\$[a-f\d]+:/.test(value)) {
        return resolveFlight(resolveReference(value, records), records, depth + 1)
    }
    if (Array.isArray(value)) {
        const elements: unknown[] = value
        return elements.map((entry) => resolveFlight(entry, records, depth + 1))
    }
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(jsonRecord.parse(value)).map(([key, entry]) => [
                key,
                resolveFlight(entry, records, depth + 1),
            ]),
        )
    }
    return value
}

function findCollections(value: unknown, key: string): unknown[][] {
    if (Array.isArray(value)) {
        const elements: unknown[] = value
        return elements.flatMap((entry) => findCollections(entry, key))
    }
    if (value !== null && typeof value === 'object') {
        const entries = Object.entries(jsonRecord.parse(value))
        const direct = new Map(entries).get(key)
        return [
            ...(Array.isArray(direct) ? [z.array(z.unknown()).parse(direct)] : []),
            ...entries.flatMap(([, entry]) => findCollections(entry, key)),
        ]
    }
    return []
}

export function extractFlightCollection(
    html: string,
    key: string,
    requiredField: string,
): unknown[] {
    const records = flightRecords(html)
    const tables = [...records.values()]
        .flatMap((record) => findCollections(record, key))
        .map((rows) => z.array(z.unknown()).parse(resolveFlight(rows, records)))
        .filter((rows) =>
            rows.some((row) => {
                const result = jsonRecord.safeParse(row)
                return result.success && Object.hasOwn(result.data, requiredField)
            }),
        )
    if (tables.length !== 1) throw new Error(`Expected one complete ${key} table`)
    return z.array(z.unknown()).parse(tables[0])
}
