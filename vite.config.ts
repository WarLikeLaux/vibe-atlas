import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { modelPages } from './scripts/model-pages.ts'
import { standaloneHtml } from './scripts/standalone-html.ts'

export default defineConfig({
    plugins: [react(), standaloneHtml(), modelPages()],
    base: '/vibe-atlas/',
})
