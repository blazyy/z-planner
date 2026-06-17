import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mutable auth state shared with the hoisted clerk mock.
const authState = vi.hoisted(() => ({ userId: null as string | null }))
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => ({ userId: authState.userId }),
}))

// dbConnect is a side-effecting connector; the suite only needs to observe that
// withDbConnect awaits it, so a resolved spy suffices (no real DB).
const dbConnectSpy = vi.hoisted(() => vi.fn(async () => undefined))
vi.mock('@/lib/dbConnect', () => ({ default: dbConnectSpy }))

import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  ExtendedNextRequest,
  jsonError,
  parseBody,
  withAuth,
  withDbConnect,
  withErrorHandling,
  withMiddleware,
} from './middleware'

const makeReq = (init?: { body?: string; method?: string; url?: string }): ExtendedNextRequest =>
  new NextRequest(init?.url ?? 'http://localhost/api/planner', {
    method: init?.method ?? 'POST',
    headers: init?.body !== undefined ? { 'content-type': 'application/json' } : {},
    body: init?.body,
  }) as ExtendedNextRequest

const ctx = { params: {} }

beforeEach(() => {
  authState.userId = null
})
afterEach(() => {
  vi.clearAllMocks()
})

describe('jsonError', () => {
  it('returns a NextResponse with the given status and { error } body', async () => {
    const res = jsonError(418, 'teapot')
    expect(res).toBeInstanceOf(NextResponse)
    expect(res.status).toBe(418)
    expect(await res.json()).toEqual({ error: 'teapot' })
  })
})

describe('parseBody', () => {
  const schema = z.object({ name: z.string() }).strict()

  it('returns typed data for a valid body', async () => {
    const result = await parseBody(makeReq({ body: JSON.stringify({ name: 'ok' }) }), schema)
    expect(result.error).toBeUndefined()
    expect(result.data).toEqual({ name: 'ok' })
  })

  it('returns a 400 for malformed JSON', async () => {
    const result = await parseBody(makeReq({ body: '{not json' }), schema)
    expect(result.data).toBeUndefined()
    expect(result.error?.status).toBe(400)
    expect(await result.error?.json()).toEqual({ error: 'Request body must be valid JSON' })
  })

  it('returns a 400 for an empty body (no JSON to parse)', async () => {
    const result = await parseBody(makeReq(), schema)
    expect(result.error?.status).toBe(400)
    expect(await result.error?.json()).toEqual({ error: 'Request body must be valid JSON' })
  })

  it('returns a 400 listing the schema issues on validation failure', async () => {
    const result = await parseBody(makeReq({ body: JSON.stringify({ name: 123 }) }), schema)
    expect(result.data).toBeUndefined()
    expect(result.error?.status).toBe(400)
    const payload = (await result.error?.json()) as { error: string }
    // Exact format: "Invalid request body — <path>: <message>; ..."
    expect(payload.error).toMatch(/^Invalid request body — /)
    expect(payload.error).toContain('name:')
  })

  it('labels a top-level (pathless) issue as "body"', async () => {
    // A non-object root yields a zod issue with an empty path -> labeled "body".
    const result = await parseBody(makeReq({ body: JSON.stringify('a string') }), schema)
    const payload = (await result.error?.json()) as { error: string }
    expect(payload.error).toContain('body:')
  })
})

describe('withAuth', () => {
  it('401s when there is no userId, without invoking the handler', async () => {
    authState.userId = null
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const res = await withAuth(handler)(makeReq(), ctx)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('populates req.userId and invokes the handler when authed', async () => {
    authState.userId = 'user_42'
    let seenUserId: string | undefined
    const handler = vi.fn(async (req: ExtendedNextRequest) => {
      seenUserId = req.userId
      return NextResponse.json({ ok: true })
    })
    const res = await withAuth(handler)(makeReq(), ctx)
    expect(res.status).toBe(200)
    expect(handler).toHaveBeenCalledOnce()
    expect(seenUserId).toBe('user_42')
  })
})

describe('withDbConnect', () => {
  it('awaits dbConnect before invoking the handler', async () => {
    const calls: string[] = []
    dbConnectSpy.mockImplementationOnce(async () => {
      calls.push('dbConnect')
      return undefined
    })
    const handler = vi.fn(async () => {
      calls.push('handler')
      return NextResponse.json({ ok: true })
    })
    await withDbConnect(handler)(makeReq(), ctx)
    expect(calls).toEqual(['dbConnect', 'handler'])
  })
})

describe('withErrorHandling', () => {
  it('maps a mongoose ValidationError to 400 "Validation failed"', async () => {
    const handler = vi.fn(async () => {
      throw new mongoose.Error.ValidationError()
    })
    const res = await withErrorHandling(handler)(makeReq(), ctx)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Validation failed' })
  })

  it('maps a generic throw to 500 "Internal server error"', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const handler = vi.fn(async () => {
      throw new Error('boom')
    })
    const res = await withErrorHandling(handler)(makeReq(), ctx)
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Internal server error' })
    errSpy.mockRestore()
  })

  it('passes a successful response through untouched', async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }, { status: 201 }))
    const res = await withErrorHandling(handler)(makeReq(), ctx)
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ ok: true })
  })
})

describe('withMiddleware composition', () => {
  it('runs withErrorHandling(withAuth(withDbConnect(handler))): auth gate fires before dbConnect/handler', async () => {
    authState.userId = null
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const res = await withMiddleware(handler)(makeReq(), ctx)
    // Unauthenticated -> 401 from withAuth; dbConnect and handler never run.
    expect(res.status).toBe(401)
    expect(dbConnectSpy).not.toHaveBeenCalled()
    expect(handler).not.toHaveBeenCalled()
  })

  it('when authed: connects, populates userId, and returns the handler result', async () => {
    authState.userId = 'user_7'
    const order: string[] = []
    dbConnectSpy.mockImplementationOnce(async () => {
      order.push('dbConnect')
      return undefined
    })
    let seenUserId: string | undefined
    const handler = vi.fn(async (req: ExtendedNextRequest) => {
      order.push('handler')
      seenUserId = req.userId
      return NextResponse.json({ ok: true })
    })
    const res = await withMiddleware(handler)(makeReq(), ctx)
    expect(res.status).toBe(200)
    expect(order).toEqual(['dbConnect', 'handler'])
    expect(seenUserId).toBe('user_7')
  })

  it('a mongoose ValidationError thrown deep in the chain surfaces as 400', async () => {
    authState.userId = 'user_7'
    const handler = vi.fn(async () => {
      throw new mongoose.Error.ValidationError()
    })
    const res = await withMiddleware(handler)(makeReq(), ctx)
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Validation failed' })
  })
})
