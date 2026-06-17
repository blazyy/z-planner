import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import {
  clearAuthUser,
  invokeRoute,
  resetDb,
  seedPlanner,
  setAuthUser,
  startMemoryMongo,
  stopMemoryMongo,
} from '@/test/helpers/routeHarness'

// Harness import registers the clerk + dbConnect mocks; route imported after.
import { GET } from './route'

// 17-char lowercase alphanumeric ids. Suffix encodes recency: higher suffix ->
// lexicographically larger -> returned first under descending-id ordering.
const CAT = 'cccccccccccccccc1'
const archivedId = (n: number) => `aaaaaaaaaaaaaaaa${n}` // n in 0..9, 17 chars

function card(id: string, status: 'created' | 'archived') {
  return { id, title: id, category: CAT, content: '', status, subTasks: [] }
}

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(resetDb)
afterEach(clearAuthUser)

type Page = {
  cards: { id: string; status: string }[]
  nextCursor: string | null
  hasMore: boolean
}

/** Seed `count` archived cards (ids ...0.. ascending) plus one 'created' card. */
function seedArchived(clerkUserId: string, count: number) {
  const taskCards: Record<string, unknown> = {
    [archivedId(0)]: card(archivedId(0), 'created'), // active card must be excluded
  }
  for (let n = 1; n <= count; n++) {
    taskCards[archivedId(n)] = card(archivedId(n), 'archived')
  }
  return seedPlanner({ clerkUserId, taskCards })
}

describe('GET /api/planner/archived', () => {
  it('returns the archived cards (excluding active ones), newest first', async () => {
    await seedArchived('user_arch_1', 3)
    setAuthUser('user_arch_1')

    const { status, body } = await invokeRoute<Page>(GET)

    expect(status).toBe(200)
    // Descending id: 3, 2, 1. The 'created' card (suffix 0) is absent.
    expect(body.cards.map((c) => c.id)).toEqual([archivedId(3), archivedId(2), archivedId(1)])
    expect(body.cards.every((c) => c.status === 'archived')).toBe(true)
    expect(body.hasMore).toBe(false)
    expect(body.nextCursor).toBeNull()
  })

  it('respects the limit query param', async () => {
    await seedArchived('user_arch_2', 5)
    setAuthUser('user_arch_2')

    const { status, body } = await invokeRoute<Page>(GET, { url: '/api/planner/archived?limit=2' })

    expect(status).toBe(200)
    expect(body.cards.map((c) => c.id)).toEqual([archivedId(5), archivedId(4)])
    expect(body.hasMore).toBe(true)
    expect(body.nextCursor).toBe(archivedId(4))
  })

  it('advances through pages via the cursor without gaps or overlap', async () => {
    await seedArchived('user_arch_3', 5)
    setAuthUser('user_arch_3')

    const first = await invokeRoute<Page>(GET, { url: '/api/planner/archived?limit=2' })
    expect(first.body.cards.map((c) => c.id)).toEqual([archivedId(5), archivedId(4)])
    expect(first.body.hasMore).toBe(true)

    const second = await invokeRoute<Page>(GET, {
      url: `/api/planner/archived?limit=2&cursor=${first.body.nextCursor}`,
    })
    expect(second.body.cards.map((c) => c.id)).toEqual([archivedId(3), archivedId(2)])
    expect(second.body.hasMore).toBe(true)

    const third = await invokeRoute<Page>(GET, {
      url: `/api/planner/archived?limit=2&cursor=${second.body.nextCursor}`,
    })
    expect(third.body.cards.map((c) => c.id)).toEqual([archivedId(1)])
    expect(third.body.hasMore).toBe(false)
    expect(third.body.nextCursor).toBeNull()
  })

  it('only returns the callers own archived cards', async () => {
    await seedArchived('user_arch_owner', 2)
    await seedArchived('user_arch_intruder', 4)
    setAuthUser('user_arch_owner')

    const { status, body } = await invokeRoute<Page>(GET)

    expect(status).toBe(200)
    // Owner seeded 2 archived cards; intruder's 4 must not leak.
    expect(body.cards.map((c) => c.id)).toEqual([archivedId(2), archivedId(1)])
  })

  it('rejects an out-of-range limit', async () => {
    await seedArchived('user_arch_4', 1)
    setAuthUser('user_arch_4')

    const { status } = await invokeRoute<Page>(GET, { url: '/api/planner/archived?limit=999' })
    expect(status).toBe(400)
  })

  it('401s when unauthenticated', async () => {
    clearAuthUser()
    const { status, body } = await invokeRoute<{ error: string }>(GET)
    expect(status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})
