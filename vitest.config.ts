import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // The React plugin transforms JSX/TSX in .test.tsx component tests. tsconfig
  // sets jsx: 'preserve' (Next compiles JSX with its own SWC), which vite's bare
  // esbuild transform inherits and leaves untransformed; the plugin handles the
  // transform for the vitest pipeline only (the next build is unaffected). It is
  // inert for the node-env .test.ts files, which contain no JSX.
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    // .test.ts run on the default node env (route/unit tests). .test.tsx are
    // React component tests that opt into jsdom per-file via the
    // `// @vitest-environment jsdom` pragma at the top of the file (vitest 4
    // dropped environmentMatchGlobs; the per-file directive is the supported
    // replacement and keeps node tests untouched — no global env switch).
    include: ['**/*.test.ts', '**/*.test.tsx'],
    // Match nested node_modules too (e.g. inside .claude/worktrees/* during a
    // parallel-agent run), and ignore .claude entirely so worktree checkouts
    // don't get their duplicate test files double-discovered.
    exclude: ['**/node_modules/**', '**/.next/**', '**/.claude/**'],
    // First run of the route harness downloads a mongod binary (~150MB) inside
    // beforeAll(startMemoryMongo); the default 10s hook timeout is too tight.
    hookTimeout: 120000,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'text', 'html'],
      // Cover our own code; exclude vendored shadcn primitives (untested
      // boilerplate), tests/helpers, type decls, config, and design docs.
      include: ['app/**', 'components/**', 'hooks/**', 'lib/**', 'utils/**', 'constants/**', 'middleware.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        'test/**',
        'components/ui/**',
        '**/*.d.ts',
        'app/**/layout.tsx',
        'app/**/loading.tsx',
      ],
      // Thresholds set just under measured coverage: a regression guard, not a
      // bar to clear. Drops below these fail CI.
      thresholds: {
        lines: 44,
        functions: 29,
        statements: 43,
        branches: 39,
      },
    },
  },
})
