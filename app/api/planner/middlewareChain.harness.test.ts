import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * IMPORT ORDER MATTERS. The clerk + dbConnect vi.mock registrations live inside
 * the harness module (test/helpers/clerkMock + db). They take effect when those
 * modules evaluate, so the harness must be imported BEFORE anything that
 * transitively pulls in '@clerk/nextjs/server' — namely @/lib/middleware and the
 * route. Importing middleware/logger first would load the real (server-only)
 * clerk module and every case would 500.
 */
import {
  clearAuthUser,
  getPlanner,
  invokeRoute,
  resetDb,
  seedPlanner,
  setAuthUser,
  startMemoryMongo,
  stopMemoryMongo,
} from '@/test/helpers/routeHarness'

import { MAX_BODY_BYTES, __resetRateLimit } from '@/lib/middleware'
import { logger } from '@/lib/logger'
import { POST } from './boards/route'

/*
 * FULL withMiddleware CHAIN, end to end, on a representative mutating route
 * (POST /api/planner/boards). Existing unit tests pin each wrapper in isolation
 * with synthetic handlers; this locks that the REAL composed chain, fronting a
 * REAL route + DB, still enforces every gate in the right order:
 *
 *   unauth                  -> 401  (and NO DB write)
 *   wrong Content-Type      -> 415
 *   body > MAX_BODY_BYTES   -> 413
 *   malformed JSON          -> 400
 *   zod violation (.strict) -> 400
 *   valid authed request    -> 201  + one audit line
 *
 * Rate-limit buckets are module-global, so __resetRateLimit() runs before each
 * case to stop token state bleeding across tests (an exhausted bucket from one
 * case would otherwise 429 the next and mask the gate under test).
 */

const USER = 'user_chain'

// A valid boardCreate payload (17-char lowercase-alnum ids per entityId schema).
const id17 = (seed: string): string => (seed + 'a'.repeat(17)).slice(0, 17)
const validBoardBody = () => ({
  boardId: id17('board'),
  boardName: 'Chain Board',
  unassignedCategoryDetails: { id: 'unassigned', name: 'Unassigned', color: 'slate' },
})

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(async () => {
  __resetRateLimit()
  await resetDb()
})
afterEach(() => {
  clearAuthUser()
  vi.restoreAllMocks()
})

describe('withMiddleware chain on POST /api/planner/boards', () => {
  it('unauthenticated -> 401 and performs NO DB write', async () => {
    await seedPlanner({ clerkUserId: USER })
    const before = await getPlanner(USER)

    clearAuthUser()
    const { status, body } = await invokeRoute<{ error: string }>(POST, {
      method: 'POST',
      url: '/api/planner/boards',
      body: validBoardBody(),
    })

    expect(status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
    // Auth gate fires before the handler: the planner doc is untouched.
    const after = await getPlanner(USER)
    expect(after?.boards).toEqual(before?.boards)
    expect(after?.boardOrder).toEqual(before?.boardOrder)
  })

  it('wrong Content-Type -> 415 (handler never reached)', async () => {
    await seedPlanner({ clerkUserId: USER })
    const before = await getPlanner(USER)
    setAuthUser(USER)

    const { status, body } = await invokeRoute<{ error: string }>(POST, {
      method: 'POST',
      url: '/api/planner/boards',
      headers: { 'content-type': 'text/plain' },
      rawBody: JSON.stringify(validBoardBody()),
    })

    expect(status).toBe(415)
    expect(body.error).toMatch(/content-type/i)
    const after = await getPlanner(USER)
    expect(after?.boards).toEqual(before?.boards)
  })

  it('oversized body (declared Content-Length > MAX_BODY_BYTES) -> 413', async () => {
    await seedPlanner({ clerkUserId: USER })
    setAuthUser(USER)

    const { status, body } = await invokeRoute<{ error: string }>(POST, {
      method: 'POST',
      url: '/api/planner/boards',
      headers: {
        'content-type': 'application/json',
        'content-length': String(MAX_BODY_BYTES + 1),
      },
      rawBody: JSON.stringify(validBoardBody()),
    })

    expect(status).toBe(413)
    expect(body.error).toMatch(/too large/i)
  })

  it('oversized body (actual decoded length > MAX_BODY_BYTES, no declared length) -> 413', async () => {
    await seedPlanner({ clerkUserId: USER })
    setAuthUser(USER)

    // A syntactically valid JSON string that decodes past the cap. The decoded
    // length guard must catch it even if Content-Length is absent/under-declared.
    const huge = 'x'.repeat(MAX_BODY_BYTES + 100)
    const rawBody = JSON.stringify({ ...validBoardBody(), boardName: huge })

    const { status, body } = await invokeRoute<{ error: string }>(POST, {
      method: 'POST',
      url: '/api/planner/boards',
      rawBody,
    })

    expect(status).toBe(413)
    expect(body.error).toMatch(/too large/i)
  })

  it('malformed JSON -> 400', async () => {
    await seedPlanner({ clerkUserId: USER })
    setAuthUser(USER)

    const { status, body } = await invokeRoute<{ error: string }>(POST, {
      method: 'POST',
      url: '/api/planner/boards',
      rawBody: '{ not valid json',
    })

    expect(status).toBe(400)
    expect(body.error).toMatch(/valid json/i)
  })

  it('zod violation: unknown field rejected by .strict() -> 400', async () => {
    await seedPlanner({ clerkUserId: USER })
    const before = await getPlanner(USER)
    setAuthUser(USER)

    const { status, body } = await invokeRoute<{ error: string }>(POST, {
      method: 'POST',
      url: '/api/planner/boards',
      body: { ...validBoardBody(), injected: 'mass-assign attempt' },
    })

    expect(status).toBe(400)
    expect(body.error).toMatch(/invalid request body/i)
    // Strict schema rejects before any write: the injected key never lands.
    const after = await getPlanner(USER)
    expect(after?.boards).toEqual(before?.boards)
  })

  it('zod violation: invalid field type/format -> 400', async () => {
    await seedPlanner({ clerkUserId: USER })
    setAuthUser(USER)

    const { status, body } = await invokeRoute<{ error: string }>(POST, {
      method: 'POST',
      url: '/api/planner/boards',
      // boardId fails the 17-char [0-9a-z] entityId regex.
      body: { ...validBoardBody(), boardId: 'TOO-SHORT' },
    })

    expect(status).toBe(400)
    expect(body.error).toMatch(/invalid request body/i)
  })

  it('valid authed request -> 201, persists the board, and logs exactly one audit line', async () => {
    await seedPlanner({ clerkUserId: USER })
    const infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined as never)
    setAuthUser(USER)

    const payload = validBoardBody()
    const { status, body } = await invokeRoute<{ boardId: string }>(POST, {
      method: 'POST',
      url: '/api/planner/boards',
      body: payload,
    })

    expect(status).toBe(201)
    expect(body).toEqual({ boardId: payload.boardId })

    // Write actually happened through the real handler + DB.
    const after = await getPlanner(USER)
    expect(after?.boards?.[payload.boardId]).toBeDefined()
    expect(after?.boardOrder).toContain(payload.boardId)

    // Exactly one structured audit line for the accepted mutation.
    const auditCalls = infoSpy.mock.calls.filter(([, msg]) => msg === 'api mutation')
    expect(auditCalls).toHaveLength(1)
    expect(auditCalls[0][0]).toEqual({
      userId: USER,
      method: 'POST',
      path: '/api/planner/boards',
      status: 201,
    })
  })
})
