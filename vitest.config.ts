import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    include: ['**/*.test.ts'],
    exclude: ['node_modules', '.next'],
    // First run of the route harness downloads a mongod binary (~150MB) inside
    // beforeAll(startMemoryMongo); the default 10s hook timeout is too tight.
    hookTimeout: 120000,
  },
})
