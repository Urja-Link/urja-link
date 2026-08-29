// @ts-expect-error vitest config types are missing in this setup
import { defineConfig } from 'vitest/config'
// @ts-expect-error vite plugin react doesn't export types completely
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        exclude: ['node_modules', 'tests/e2e/**'],
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
