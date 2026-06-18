import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

/*
 * META-TEST: every API route ships behind withMiddleware.
 *
 * withMiddleware is the single composition that wires the security chain
 * (withErrorHandling -> withAuth -> withRateLimit -> withAudit -> withDbConnect).
 * If a future route exports an HTTP handler that does NOT go through it, that
 * endpoint ships with no auth gate, no rate limit, and no audit log — a silent
 * downgrade of every invariant the rest of this suite pins.
 *
 * Rather than trust that today's routes stay correct, this statically inspects
 * EVERY app/api/**\/route.ts: it finds each exported HTTP handler
 * (GET/POST/PATCH/DELETE) and asserts its initializer is a withMiddleware(...)
 * call. A new unprotected endpoint fails here the moment it lands.
 *
 * This is intentionally source-level (fs + regex) rather than importing the
 * routes: importing would execute module side effects and couple this guard to
 * runtime wiring, whereas the invariant we want to lock is "the source declares
 * the handler through withMiddleware".
 */

const HTTP_METHODS = ['GET', 'POST', 'PATCH', 'DELETE'] as const
type HttpMethod = (typeof HTTP_METHODS)[number]

const API_ROOT = join(process.cwd(), 'app', 'api')

/** Absolute paths of every route handler file under app/api (recursive walk). */
function routeFiles(): string[] {
  const found: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.isFile() && entry.name === 'route.ts') {
        found.push(full)
      }
    }
  }
  walk(API_ROOT)
  return found.sort()
}

interface ExportedHandler {
  method: HttpMethod
  /** The raw initializer text following `export const METHOD =`, trimmed. */
  initializer: string
}

/*
 * Parse the `export const <METHOD> = <initializer>` declarations out of a route
 * source. Strips line comments so a commented-out example can't satisfy or
 * falsely fail the check. The initializer is captured up to the end of the line,
 * which is enough to assert it begins with a withMiddleware( call (every handler
 * in this codebase opens the composition on the declaration line).
 */
function parseExportedHandlers(source: string): ExportedHandler[] {
  const handlers: ExportedHandler[] = []
  const lines = source.split('\n')
  for (const rawLine of lines) {
    const line = rawLine.replace(/\/\/.*$/, '')
    const match = line.match(/^\s*export\s+const\s+(GET|POST|PATCH|DELETE)\s*(?::[^=]+)?=\s*(.+)$/)
    if (match) {
      handlers.push({ method: match[1] as HttpMethod, initializer: match[2].trim() })
    }
  }
  return handlers
}

describe('meta: every app/api route handler is wrapped in withMiddleware', () => {
  const files = routeFiles()

  it('discovers route files to inspect (guards against a broken glob silently passing)', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('every route.ts exports at least one HTTP handler', () => {
    const offenders: string[] = []
    for (const file of files) {
      const handlers = parseExportedHandlers(readFileSync(file, 'utf8'))
      if (handlers.length === 0) {
        offenders.push(relative(process.cwd(), file))
      }
    }
    expect(offenders, `route files exporting no GET/POST/PATCH/DELETE handler:\n${offenders.join('\n')}`).toEqual([])
  })

  it('every exported GET/POST/PATCH/DELETE handler is built through withMiddleware(', () => {
    const offenders: string[] = []
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      const rel = relative(process.cwd(), file)
      for (const { method, initializer } of parseExportedHandlers(source)) {
        if (!initializer.startsWith('withMiddleware(')) {
          offenders.push(`${rel} :: export const ${method} = ${initializer}`)
        }
      }
    }
    expect(
      offenders,
      `the following route handlers are NOT wrapped in withMiddleware (unprotected endpoints):\n${offenders.join('\n')}`
    ).toEqual([])
  })

  it('each route file imports withMiddleware (the symbol it claims to use)', () => {
    const offenders: string[] = []
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      // Only meaningful for files that actually export a handler.
      if (parseExportedHandlers(source).length === 0) continue
      const importsIt = /from\s+['"]@\/lib\/middleware['"]/.test(source) && /\bwithMiddleware\b/.test(source)
      if (!importsIt) {
        offenders.push(relative(process.cwd(), file))
      }
    }
    expect(offenders, `route files using withMiddleware without importing it:\n${offenders.join('\n')}`).toEqual([])
  })
})
