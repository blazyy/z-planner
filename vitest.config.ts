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
    // Match nested node_modules too (e.g. inside .claude/worktrees/* during a
    // parallel-agent run), and ignore .claude entirely so worktree checkouts
    // don't get their duplicate test files double-discovered.
    exclude: ['**/node_modules/**', '**/.next/**', '**/.claude/**'],
    // First run of the route harness downloads a mongod binary (~150MB) inside
    // beforeAll(startMemoryMongo); the default 10s hook timeout is too tight.
    hookTimeout: 120000,
  },
})
