import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/*
 * IMPORT ORDER MATTERS — harness first (registers the clerk + dbConnect mocks)
 * before middleware / route, which transitively pull in server-only clerk.
 */
import {
  clearAuthUser,
  invokeRoute,
  resetDb,
  setAuthUser,
  startMemoryMongo,
  stopMemoryMongo,
} from '@/test/helpers/routeHarness'

import { RATE_LIMIT_CAPACITY, __resetRateLimit } from '@/lib/middleware'
import { GET } from './route'

/*
 * RATE-LIMIT INVARIANT through the real withMiddleware chain.
 *
 * The limiter unit test pins the bucket math directly; this pins that the limit
 * is actually WIRED into the composed chain fronting a real route, and is keyed
 * per tenant:
 *   - the first RATE_LIMIT_CAPACITY authed requests pass,
 *   - the next one is throttled with 429 + a Retry-After header,
 *   - a *different* user, having spent no tokens, is unaffected.
 *
 * GET /api/planner is used because it upserts-and-returns-200 for any authed
 * user (no seed needed) and is not audited, so the only thing varying across the
 * burst is the rate-limit bucket. Buckets are module-global, so __resetRateLimit
 * runs before each case to keep tests independent.
 *
 * DETERMINISM: the limiter refills lazily from Date.now() elapsed. The real DB
 * upserts in each request take real milliseconds, which would refill tokens
 * mid-burst and let the (capacity+1)th request through. We fake ONLY Date (not
 * timers) so wall-clock is frozen during the burst — the bucket can't refill —
 * while leaving setTimeout/setInterval real so mongoose's own timers still fire.
 */

const USER_A = 'user_rl_a'
const USER_B = 'user_rl_b'

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(async () => {
  // Freeze wall-clock (Date only) so the bucket cannot refill during the burst.
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(0)
  __resetRateLimit()
  await resetDb()
})
afterEach(() => {
  vi.useRealTimers()
  clearAuthUser()
})

describe('rate-limit invariant on the wrapped GET /api/planner', () => {
  it('passes exactly RATE_LIMIT_CAPACITY requests, then 429s with Retry-After', async () => {
    setAuthUser(USER_A)

    for (let i = 0; i < RATE_LIMIT_CAPACITY; i++) {
      const { status } = await invokeRoute(GET)
      expect(status, `request ${i + 1} of the burst should pass`).toBe(200)
    }

    const { status, body, raw } = await invokeRoute<{ error: string }>(GET)
    expect(status).toBe(429)
    expect(body).toEqual({ error: 'Too many requests' })
    const retryAfter = raw.headers.get('Retry-After')
    expect(retryAfter).not.toBeNull()
    // Retry-After is a positive integer count of seconds.
    expect(Number(retryAfter)).toBeGreaterThan(0)
    expect(Number.isInteger(Number(retryAfter))).toBe(true)
  })

  it('is per-tenant: exhausting user A does not throttle user B', async () => {
    // Drain A's bucket to empty (+1 to trigger the 429).
    setAuthUser(USER_A)
    for (let i = 0; i < RATE_LIMIT_CAPACITY; i++) {
      await invokeRoute(GET)
    }
    const aThrottled = await invokeRoute(GET)
    expect(aThrottled.status).toBe(429)

    // B has its own fresh bucket and sails through.
    setAuthUser(USER_B)
    const bFirst = await invokeRoute(GET)
    expect(bFirst.status).toBe(200)
    for (let i = 1; i < RATE_LIMIT_CAPACITY; i++) {
      const { status } = await invokeRoute(GET)
      expect(status).toBe(200)
    }
    // ...and B exhausts independently right after its own capacity.
    const bThrottled = await invokeRoute(GET)
    expect(bThrottled.status).toBe(429)

    // A is still throttled — B's traffic did not refill A.
    setAuthUser(USER_A)
    const aStill = await invokeRoute(GET)
    expect(aStill.status).toBe(429)
  })

  it('an exhausted bucket recovers after enough wall-clock elapses (lazy refill)', async () => {
    setAuthUser(USER_A)
    for (let i = 0; i < RATE_LIMIT_CAPACITY; i++) {
      await invokeRoute(GET)
    }
    expect((await invokeRoute(GET)).status).toBe(429)

    // Advance frozen Date by 1s -> RATE_LIMIT_REFILL_PER_SEC tokens replenished,
    // so the next request passes again. Confirms the limiter throttles, it
    // doesn't permanently lock the tenant out.
    vi.setSystemTime(1000)
    expect((await invokeRoute(GET)).status).toBe(200)
  })

  it('unauthenticated requests 401 and never consume a bucket', async () => {
    clearAuthUser()
    // Fire more than capacity unauthenticated — every one 401s (auth gates before
    // the limiter), so no bucket is ever created/spent.
    for (let i = 0; i < RATE_LIMIT_CAPACITY + 5; i++) {
      const { status } = await invokeRoute(GET)
      expect(status).toBe(401)
    }

    // The same identity, now authed, still has a full bucket available.
    setAuthUser(USER_A)
    for (let i = 0; i < RATE_LIMIT_CAPACITY; i++) {
      const { status } = await invokeRoute(GET)
      expect(status).toBe(200)
    }
    const throttled = await invokeRoute(GET)
    expect(throttled.status).toBe(429)
  })
})
