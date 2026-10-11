import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { build } from 'vite'

import { standaloneHtml } from './standalone-html.ts'

await test('Vite export embeds downloads and fonts, preserves literal replacement characters and escapes script boundaries', async () => {
    const original = process.cwd()
    const directory = await mkdtemp(path.join(os.tmpdir(), 'vibe-atlas-export-'))
    process.chdir(directory)
    try {
        await mkdir('public', { recursive: true })
        await writeFile(
            'index.html',
            '<link rel="icon" href="/vibe-atlas/favicon.svg"><script type="module" src="/app.js"></script>',
        )
        await writeFile(
            'app.js',
            'import "./style.css"; import download from "./results.json?url"; globalThis.fixture = {literal: "$& </script>", download};',
        )
        await writeFile(
            'style.css',
            '@font-face{font-family:fixture;src:url(./font.woff2)}body{font-family:fixture}',
        )
        await writeFile('results.json', '{"score":0}')
        await writeFile('font.woff2', 'synthetic font')
        await writeFile('public/favicon.svg', '<svg/>')
        const config = {
            configFile: false as const,
            root: directory,
            base: '/vibe-atlas/',
            plugins: [standaloneHtml()],
            logLevel: 'silent' as const,
            build: { assetsInlineLimit: 0, minify: false as const },
        }
        await build(config)
        const output = await readFile('dist/vibe-atlas.html', 'utf8')
        assert.match(output, /\$& <\\\/script>/)
        assert.match(output, /data:application\/json;base64,eyJzY29yZSI6MH0=/)
        assert.match(output, /data:font\/woff2;base64,/)
        assert.equal([...output.matchAll(/<\/script>/g)].length, 1)
        assert.doesNotMatch(output, /\/vibe-atlas\//)
        await writeFile(
            'app.js',
            'import "./style.css"; globalThis.fixture = "/vibe-atlas/../outside.json";',
        )
        await assert.rejects(build(config), /Missing or unsupported built asset/)
    } finally {
        process.chdir(original)
        await rm(directory, { recursive: true, force: true })
    }
})
