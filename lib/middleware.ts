import dbConnect from '@/lib/dbConnect'
import { logger } from '@/lib/logger'
import { auth } from '@clerk/nextjs/server'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'

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

export function withAuth(handler: Handler): Handler {
  return async (req, context) => {
    const { userId } = auth()
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

export function withMiddleware(handler: Handler): Handler {
  return withErrorHandling(withAuth(withDbConnect(handler)))
}
