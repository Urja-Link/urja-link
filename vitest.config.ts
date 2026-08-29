// @ts-expect-error vitest config types are missing in this setup
import { defineConfig } from 'vitest/config'
// @ts-expect-error vite plugin react doesn't export types completely
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
