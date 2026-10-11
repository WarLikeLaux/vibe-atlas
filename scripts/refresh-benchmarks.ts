import { spawn } from 'node:child_process'
import { parseArgs } from 'node:util'

import { z } from 'zod'

import jobData from '../data/import-jobs.json' with { type: 'json' }

const { values } = parseArgs({ options: { source: { type: 'string' } } })
const jobs = z
    .strictObject({
        version: z.literal(1),
        jobs: z
            .array(
                z.strictObject({
                    id: z.string().min(1),
                    script: z.string().regex(/^scripts\/import-[a-z-]+\.ts$/),
                }),
            )
            .min(1),
    })
    .parse(jobData).jobs
if (new Set(jobs.map((job) => job.id)).size !== jobs.length)
    throw new Error('Duplicate importer job identifiers')
const selected = values.source ? jobs.filter((job) => job.id === values.source) : jobs
if (selected.length === 0) throw new Error(`Unknown source: ${values.source ?? ''}`)

async function command(executable: string, arguments_: string[]) {
    await new Promise<void>((resolve, reject) => {
        const child = spawn(executable, arguments_, { stdio: 'inherit' })
        child.on('error', reject)
        child.on('exit', (code) => {
            if (code === 0) resolve()
            else reject(new Error(`Command failed: ${executable} ${arguments_.join(' ')}`))
        })
    })
}

for (const job of selected)
    await command(process.execPath, ['--experimental-strip-types', job.script])
await command('npm', ['run', 'check'])
