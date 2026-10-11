import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { standaloneHtml } from './scripts/standalone-html.ts'

export default defineConfig({
    plugins: [react(), standaloneHtml()],
    base: '/vibe-atlas/',
})
