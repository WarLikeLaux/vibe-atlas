import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { Plugin } from 'vite'

const mimeTypes = new Map([
    ['.json', 'application/json'],
    ['.svg', 'image/svg+xml'],
    ['.woff2', 'font/woff2'],
    ['.png', 'image/png'],
    ['.jpg', 'image/jpeg'],
    ['.webp', 'image/webp'],
])

function inlineAssets(contents: string, assets: Map<string, string | Uint8Array>) {
    const urls = new Set(
        [...contents.matchAll(/\/vibe-atlas\/[a-z\d_./-]+/gi)].map((match) => match[0]),
    )
    for (const url of urls) {
        const source = assets.get(url.slice('/vibe-atlas/'.length))
        const mime = mimeTypes.get(path.extname(url))
        if (source === undefined || !mime)
            throw new Error(`Missing or unsupported built asset: ${url}`)
        contents = contents.replaceAll(
            url,
            `data:${mime};base64,${Buffer.from(source).toString('base64')}`,
        )
    }
    return contents
}

export function standaloneHtml(): Plugin {
    return {
        name: 'vibe-atlas-standalone-html',
        apply: 'build',
        enforce: 'post',
        async generateBundle(_, bundle) {
            const entries = Object.values(bundle)
            const assets = new Map(
                entries.flatMap((entry) =>
                    entry.type === 'asset' ? [[entry.fileName, entry.source] as const] : [],
                ),
            )
            assets.set('favicon.svg', await readFile('public/favicon.svg'))
            const htmlSource = assets.get('index.html')
            if (typeof htmlSource !== 'string') throw new Error('Built index.html is missing')
            let html = htmlSource
            const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)]
            const styles = [
                ...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g),
            ]
            const chunks = entries.filter((entry) => entry.type === 'chunk')
            if (
                chunks.length !== 1 ||
                scripts.length !== 1 ||
                styles.length !== 1 ||
                html.includes('rel="modulepreload"')
            )
                throw new Error('Review standalone export after changing Vite chunking')
            const chunk = chunks[0],
                script = scripts[0],
                style = styles[0]
            if (!chunk || !script || !style) throw new Error('Missing HTML entry assets')
            if (script[1] !== `/vibe-atlas/${chunk.fileName}`)
                throw new Error('Unexpected entry script URL')
            const cssSource = assets.get((style[1] ?? '').slice('/vibe-atlas/'.length))
            if (typeof cssSource !== 'string') throw new Error('Missing stylesheet')
            const javascript = inlineAssets(chunk.code, assets).replaceAll(
                /<\/script/gi,
                String.raw`<\/script`,
            )
            const css = inlineAssets(cssSource, assets).replaceAll(
                /<\/style/gi,
                String.raw`<\/style`,
            )
            html = html.replace(script[0], () => `<script type="module">${javascript}</script>`)
            html = html.replace(style[0], () => `<style>${css}</style>`)
            this.emitFile({
                type: 'asset',
                fileName: 'vibe-atlas.html',
                source: inlineAssets(html, assets),
            })
        },
    }
}
