import dbConnect from '@/lib/dbConnect'
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
 * Parses and validates a request body against a zod schema. Returns either the
 * typed data or a ready-to-return 400 response (covers malformed/empty JSON too,
 * which used to escape the error handler entirely as an unawaited rejection).
 */
export async function parseBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  let raw: unknown
  try {
    raw = await req.json()
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
      console.error(`[api] ${req.method} ${req.nextUrl.pathname}:`, error)
      return jsonError(500, 'Internal server error')
    }
  }
}

export function withMiddleware(handler: Handler): Handler {
  return withErrorHandling(withAuth(withDbConnect(handler)))
}
