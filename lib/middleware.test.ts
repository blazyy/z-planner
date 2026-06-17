import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mutable auth state shared with the hoisted clerk mock.
const authState = vi.hoisted(() => ({ userId: null as string | null }))
vi.mock('@clerk/nextjs/server', () => ({
  // Clerk v6: auth() is async.
  auth: async () => ({ userId: authState.userId }),
}))

// dbConnect is a side-effecting connector; the suite only needs to observe that
// withDbConnect awaits it, so a resolved spy suffices (no real DB).
const dbConnectSpy = vi.hoisted(() => vi.fn(async () => undefined))
vi.mock('@/lib/dbConnect', () => ({ default: dbConnectSpy }))

import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  __resetRateLimit,
  ExtendedNextRequest,
  jsonError,
  MAX_BODY_BYTES,
  parseBody,
  RATE_LIMIT_CAPACITY,
  RATE_LIMIT_REFILL_PER_SEC,
  withAudit,
  withAuth,
  withDbConnect,
  withErrorHandling,
  withMiddleware,
  withRateLimit,
} from './middleware'

import { logger } from '@/lib/logger'

const makeReq = (init?: { body?: string; method?: string; url?: string }): ExtendedNextRequest =>
  new NextRequest(init?.url ?? 'http://localhost/api/planner', {
    method: init?.method ?? 'POST',
    headers: init?.body !== undefined ? { 'content-type': 'application/json' } : {},
    body: init?.body,
  }) as ExtendedNextRequest

const ctx = { params: {} }

beforeEach(() => {
  authState.userId = null
  __resetRateLimit()
})
afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
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

  it('rejects a non-JSON Content-Type with 415', async () => {
    const req = new NextRequest('http://localhost/api/planner', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({ name: 'ok' }),
    })
    const result = await parseBody(req, schema)
    expect(result.data).toBeUndefined()
    expect(result.error?.status).toBe(415)
    expect(await result.error?.json()).toEqual({ error: 'Content-Type must be application/json' })
  })

  it('accepts application/json with charset params (only the media type matters)', async () => {
    const req = new NextRequest('http://localhost/api/planner', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ name: 'ok' }),
    })
    const result = await parseBody(req, schema)
    expect(result.error).toBeUndefined()
    expect(result.data).toEqual({ name: 'ok' })
  })

  it('rejects an oversized body via the Content-Length header with 413', async () => {
    const req = new NextRequest('http://localhost/api/planner', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': String(MAX_BODY_BYTES + 1) },
      body: JSON.stringify({ name: 'small' }),
    })
    const result = await parseBody(req, schema)
    expect(result.data).toBeUndefined()
    expect(result.error?.status).toBe(413)
    expect(await result.error?.json()).toEqual({ error: 'Request body too large' })
  })

  it('rejects an oversized body by decoded length when no Content-Length is declared', async () => {
    // Build a payload whose UTF-8 byte length exceeds the cap; the value schema
    // is permissive so the size guard (not zod) is what rejects it.
    const big = 'x'.repeat(MAX_BODY_BYTES + 10)
    const req = new NextRequest('http://localhost/api/planner', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: big }),
    })
    const result = await parseBody(req, schema)
    expect(result.error?.status).toBe(413)
    expect(await result.error?.json()).toEqual({ error: 'Request body too large' })
  })

  it('a body exactly at the cap still parses', async () => {
    const body = JSON.stringify({ name: 'ok' })
    const req = new NextRequest('http://localhost/api/planner', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'content-length': String(Buffer.byteLength(body)) },
      body,
    })
    const result = await parseBody(req, schema)
    expect(result.error).toBeUndefined()
    expect(result.data).toEqual({ name: 'ok' })
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

describe('withRateLimit', () => {
  // The limiter runs after withAuth in the real chain, so req.userId is already
  // set. Build a request and stamp the userId the way withAuth would.
  const makeAuthedReq = (userId: string): ExtendedNextRequest => {
    const req = makeReq()
    req.userId = userId
    return req
  }

  it('lets requests under capacity through and invokes the handler each time', async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withRateLimit(handler)
    const req = makeAuthedReq('user_rl_1')

    for (let i = 0; i < RATE_LIMIT_CAPACITY; i++) {
      const res = await wrapped(req, ctx)
      expect(res.status).toBe(200)
    }
    expect(handler).toHaveBeenCalledTimes(RATE_LIMIT_CAPACITY)
  })

  it('returns 429 with a Retry-After header once the bucket is exhausted', async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withRateLimit(handler)
    const req = makeAuthedReq('user_rl_2')

    // Drain the full burst budget.
    for (let i = 0; i < RATE_LIMIT_CAPACITY; i++) {
      await wrapped(req, ctx)
    }
    handler.mockClear()

    // The next request (no time elapsed -> no refill) is throttled.
    const res = await wrapped(req, ctx)
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: 'Too many requests' })
    expect(res.headers.get('Retry-After')).toBe('1')
    expect(handler).not.toHaveBeenCalled()
  })

  it('refills tokens over elapsed time (fake timers)', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withRateLimit(handler)
    const req = makeAuthedReq('user_rl_3')

    // Exhaust the bucket.
    for (let i = 0; i < RATE_LIMIT_CAPACITY; i++) {
      await wrapped(req, ctx)
    }
    expect((await wrapped(req, ctx)).status).toBe(429)

    // Advance 1s -> RATE_LIMIT_REFILL_PER_SEC tokens replenished.
    vi.setSystemTime(1000)
    handler.mockClear()
    for (let i = 0; i < RATE_LIMIT_REFILL_PER_SEC; i++) {
      expect((await wrapped(req, ctx)).status).toBe(200)
    }
    // ...and the bucket is empty again immediately after.
    expect((await wrapped(req, ctx)).status).toBe(429)
    expect(handler).toHaveBeenCalledTimes(RATE_LIMIT_REFILL_PER_SEC)
  })

  it('is per-user: exhausting user A does not throttle user B', async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withRateLimit(handler)
    const reqA = makeAuthedReq('user_A')
    const reqB = makeAuthedReq('user_B')

    // Exhaust A.
    for (let i = 0; i < RATE_LIMIT_CAPACITY; i++) {
      await wrapped(reqA, ctx)
    }
    expect((await wrapped(reqA, ctx)).status).toBe(429)

    // B has a full, independent bucket.
    expect((await wrapped(reqB, ctx)).status).toBe(200)
  })
})

describe('withAudit', () => {
  const makeAuditReq = (method: string, userId = 'user_audit'): ExtendedNextRequest => {
    const req = makeReq({ method })
    req.userId = userId
    return req
  }

  it('logs { userId, method, path, status } at info for a mutation', async () => {
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined as never)
    const handler = vi.fn(async () => NextResponse.json({ ok: true }, { status: 201 }))
    const res = await withAudit(handler)(makeAuditReq('POST'), ctx)

    expect(res.status).toBe(201)
    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledWith(
      { userId: 'user_audit', method: 'POST', path: '/api/planner', status: 201 },
      'api mutation'
    )
    infoSpy.mockRestore()
  })

  it.each(['PATCH', 'DELETE'])('also audits %s mutations', async (method) => {
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined as never)
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    await withAudit(handler)(makeAuditReq(method), ctx)
    expect(infoSpy).toHaveBeenCalledWith(expect.objectContaining({ method, userId: 'user_audit' }), 'api mutation')
    infoSpy.mockRestore()
  })

  it('does NOT log for a GET (reads are not audited)', async () => {
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined as never)
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    await withAudit(handler)(makeAuditReq('GET'), ctx)
    expect(infoSpy).not.toHaveBeenCalled()
    infoSpy.mockRestore()
  })

  it('returns the handler response unchanged (byte-identical)', async () => {
    const handler = vi.fn(async () => NextResponse.json({ deep: { value: 7 } }, { status: 200 }))
    const res = await withAudit(handler)(makeAuditReq('POST'), ctx)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ deep: { value: 7 } })
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

  it('throttles to 429 once the authed user exhausts the bucket (rate limit wired into the chain)', async () => {
    authState.userId = 'user_chain_rl'
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withMiddleware(handler)

    for (let i = 0; i < RATE_LIMIT_CAPACITY; i++) {
      expect((await wrapped(makeReq(), ctx)).status).toBe(200)
    }
    const res = await wrapped(makeReq(), ctx)
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: 'Too many requests' })
  })

  it('an unauthenticated request never consumes a rate-limit token (auth gates first)', async () => {
    authState.userId = null
    const handler = vi.fn(async () => NextResponse.json({ ok: true }))
    const wrapped = withMiddleware(handler)
    // Many unauth hits all 401; none should touch the limiter.
    for (let i = 0; i < RATE_LIMIT_CAPACITY + 5; i++) {
      expect((await wrapped(makeReq(), ctx)).status).toBe(401)
    }
    // Now authenticate the same nominal flow -> a full bucket is available.
    authState.userId = 'user_after_unauth'
    expect((await wrapped(makeReq(), ctx)).status).toBe(200)
  })

  it('audits a mutation through the full chain at info level', async () => {
    authState.userId = 'user_chain_audit'
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined as never)
    const handler = vi.fn(async () => NextResponse.json({ ok: true }, { status: 201 }))
    const res = await withMiddleware(handler)(makeReq({ method: 'POST' }), ctx)
    expect(res.status).toBe(201)
    expect(infoSpy).toHaveBeenCalledWith(
      { userId: 'user_chain_audit', method: 'POST', path: '/api/planner', status: 201 },
      'api mutation'
    )
    infoSpy.mockRestore()
  })
})
