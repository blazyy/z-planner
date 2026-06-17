import { auth } from '@clerk/nextjs/server'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'

import dbConnect from '@/lib/dbConnect'
import { logger } from '@/lib/logger'

export interface ExtendedNextRequest extends NextRequest {
  userId?: string
}

export interface Params {
  boardId?: string
  columnId?: string
  cardId?: string
  categoryId?: string
  subTaskId?: string
}

export interface ExtendedNextContext {
  params: Params
}

type Handler = (req: ExtendedNextRequest, context: ExtendedNextContext) => Promise<NextResponse>

export function jsonError(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status })
}

/*
 * Hard cap on request body size. The largest legitimate payload is a card's
 * content field (max 50000 chars ~= 50KB per apiSchemas.ts), so 1MB leaves a
 * generous margin while bounding memory spent parsing hostile/oversized bodies.
 */
export const MAX_BODY_BYTES = 1024 * 1024

/*
 * Parses and validates a request body against a zod schema. Returns either the
 * typed data or a ready-to-return error response.
 *
 * Input hardening (additive — valid JSON requests are unaffected):
 *   - If a Content-Type header is present it must be application/json, else 415.
 *     (A missing Content-Type falls through to the JSON parse, which yields the
 *     existing 400 for empty/malformed bodies.)
 *   - Bodies above MAX_BODY_BYTES are rejected with 413, checked both via the
 *     declared Content-Length and against the actual decoded byte length.
 *   - Malformed/empty JSON -> 400; zod violations -> 400 (unchanged).
 */
export async function parseBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  const contentType = req.headers.get('content-type')
  if (contentType !== null && !contentType.toLowerCase().split(';')[0].trim().startsWith('application/json')) {
    return { error: jsonError(415, 'Content-Type must be application/json') }
  }

  const declaredLength = Number(req.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return { error: jsonError(413, 'Request body too large') }
  }

  let text: string
  try {
    text = await req.text()
  } catch {
    return { error: jsonError(400, 'Request body must be valid JSON') }
  }
  // Guard chunked/Content-Length-less bodies against the same cap.
  if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
    return { error: jsonError(413, 'Request body too large') }
  }

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { error: jsonError(400, 'Request body must be valid JSON') }
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
    return { error: jsonError(400, `Invalid request body — ${issues.join('; ')}`) }
  }
  return { data: parsed.data }
}

export function withDbConnect(handler: Handler): Handler {
  return async (req, context) => {
    await dbConnect()
    return await handler(req, context)
  }
}

/*
 * In-memory per-user token-bucket rate limiter.
 *
 * Numbers (documented): the app fires debounced autosaves on keystrokes plus
 * drag-and-drop reorders, so a single active user can legitimately burst a lot
 * of mutations in a short window. We size for that:
 *   - RATE_LIMIT_CAPACITY = 60 tokens — burst budget. A user can fire up to 60
 *     requests back-to-back (covers a flurry of debounced saves + a DnD spree)
 *     before being throttled.
 *   - RATE_LIMIT_REFILL_PER_SEC = 10 tokens/sec — steady-state replenish. Once
 *     the burst is spent, sustained traffic is capped at ~10 req/s/user, which
 *     is well above any human-driven save/reorder cadence but bounds abuse.
 * A full bucket therefore tolerates a 60-request burst, then 10 req/s forever.
 *
 * SERVERLESS CAVEAT: this state is a module-level Map, so it is per-process.
 * Under serverless (multiple lambda instances) the effective limit is
 * per-instance, not global — N instances => up to N*capacity burst. That is
 * acceptable for this app: the goal is cheap, dependency-free protection
 * against a single runaway client/tab, not a hard global quota. A global cap
 * would need an external store (Redis et al.), deliberately out of scope here.
 */
export const RATE_LIMIT_CAPACITY = 60
export const RATE_LIMIT_REFILL_PER_SEC = 10

interface TokenBucket {
  tokens: number
  lastRefill: number
}

// Keyed by userId. Module-level so it survives across requests within a process.
const rateLimitBuckets = new Map<string, TokenBucket>()

/** Test-only: clear all buckets so suites don't leak token state across cases. */
export function __resetRateLimit(): void {
  rateLimitBuckets.clear()
}

/*
 * Per-user token bucket. Inserted AFTER withAuth so req.userId is populated and
 * the limit is keyed per tenant. Refills lazily from elapsed wall-clock time on
 * each request (no timers). On exhaustion returns 429 with a Retry-After hint.
 */
export function withRateLimit(handler: Handler): Handler {
  return async (req, context) => {
    // Should always be set (withAuth runs first); fall back defensively so an
    // unkeyed request can't bypass the limiter entirely.
    const key = req.userId ?? '__anonymous__'
    const now = Date.now()

    let bucket = rateLimitBuckets.get(key)
    if (!bucket) {
      bucket = { tokens: RATE_LIMIT_CAPACITY, lastRefill: now }
      rateLimitBuckets.set(key, bucket)
    } else {
      const elapsedSec = (now - bucket.lastRefill) / 1000
      if (elapsedSec > 0) {
        bucket.tokens = Math.min(RATE_LIMIT_CAPACITY, bucket.tokens + elapsedSec * RATE_LIMIT_REFILL_PER_SEC)
        bucket.lastRefill = now
      }
    }

    if (bucket.tokens < 1) {
      // Seconds until one whole token is available again.
      const retryAfter = Math.ceil((1 - bucket.tokens) / RATE_LIMIT_REFILL_PER_SEC)
      const res = jsonError(429, 'Too many requests')
      res.headers.set('Retry-After', String(retryAfter))
      return res
    }

    bucket.tokens -= 1
    return await handler(req, context)
  }
}

export function withAuth(handler: Handler): Handler {
  return async (req, context) => {
    // Clerk v6: auth() is async and must be awaited.
    const { userId } = await auth()
    if (!userId) {
      return jsonError(401, 'Unauthorized')
    }
    req.userId = userId
    return await handler(req, context)
  }
}

export function withErrorHandling(handler: Handler): Handler {
  return async (req, context) => {
    try {
      return await handler(req, context)
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return jsonError(400, 'Validation failed')
      }
      logger.error({ method: req.method, path: req.nextUrl.pathname, err: error }, 'unhandled api error')
      return jsonError(500, 'Internal server error')
    }
  }
}

/*
 * Structured mutation audit log. Logs { userId, method, path, status } at info
 * level AFTER the handler resolves, for mutating verbs only (POST/PATCH/DELETE);
 * GETs are skipped to avoid read-traffic noise. Cheap and non-blocking — it
 * never inspects or alters the response, so responses stay byte-identical.
 * Thrown errors are already logged by withErrorHandling, so this only covers the
 * resolved path. Silent under tests (the pino logger is level 'silent' when
 * VITEST is set).
 */
const AUDITED_METHODS = new Set(['POST', 'PATCH', 'DELETE'])

export function withAudit(handler: Handler): Handler {
  return async (req, context) => {
    const res = await handler(req, context)
    if (AUDITED_METHODS.has(req.method)) {
      logger.info(
        { userId: req.userId, method: req.method, path: req.nextUrl.pathname, status: res.status },
        'api mutation'
      )
    }
    return res
  }
}

/*
 * Composition order (outer -> inner):
 *   withErrorHandling( withAuth( withRateLimit( withAudit( withDbConnect(h) ) ) ) )
 *
 * - withAuth before withRateLimit so the limiter keys on req.userId (per tenant)
 *   and unauthenticated traffic 401s without consuming any bucket.
 * - withRateLimit before the DB connect/handler so throttled requests are cheap
 *   (no DB work for a 429).
 * - withAudit wraps the handler (after dbConnect would be equivalent; placing it
 *   here means it only logs requests that passed auth + rate limiting, i.e. real
 *   accepted mutations). It reads the resolved status without touching the body.
 */
export function withMiddleware(handler: Handler): Handler {
  return withErrorHandling(withAuth(withRateLimit(withAudit(withDbConnect(handler)))))
}
