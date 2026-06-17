import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

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

// Harness import registers mocks before the route binds to them.
import { GET } from './route'

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(resetDb)
afterEach(clearAuthUser)

/*
 * Tests for refactor-1: archived-card purge past ARCHIVED_CARD_CAP (200) with an
 * archivedAt recency ordering, plus the BSON soft-limit aggressive purge.
 *
 * These keep the value out of the import surface (route modules can't export it)
 * by asserting against the literal cap = 200 / aggressive cap = 50.
 */
const ARCHIVED_CARD_CAP = 200
const BSON_AGGRESSIVE_CAP = 50

type Card = {
  id: string
  title: string
  category: string
  content: string
  status: string
  subTasks: string[]
  archivedAt?: Date
}

function archivedCard(id: string, ageMsAgo: number, content = ''): Card {
  return {
    id,
    title: id,
    category: 'cat1',
    content,
    status: 'archived',
    subTasks: [],
    // Older = larger ageMsAgo => earlier timestamp => purged first.
    archivedAt: new Date(Date.now() - ageMsAgo),
  }
}

function createdCard(id: string): Card {
  return { id, title: id, category: 'cat1', content: '', status: 'created', subTasks: [] }
}

describe('GET /api/planner — archived purge (refactor-1)', () => {
  it('within the cap: every archived card is retained, nothing purged', async () => {
    const taskCards: Record<string, Card> = {}
    for (let i = 0; i < ARCHIVED_CARD_CAP; i++) {
      taskCards[`a${i}`] = archivedCard(`a${i}`, i * 1000)
    }
    await seedPlanner({ clerkUserId: 'cap_under', taskCards })
    setAuthUser('cap_under')

    const { status } = await invokeRoute(GET)
    expect(status).toBe(200)

    const stored = await getPlanner('cap_under')
    const tc = stored!.taskCards as unknown as Record<string, Card>
    const archivedKeys = Object.keys(tc).filter((k) => tc[k].status === 'archived')
    expect(archivedKeys).toHaveLength(ARCHIVED_CARD_CAP)
  })

  it('beyond the cap: oldest archived cards purged, exactly the cap retained', async () => {
    const taskCards: Record<string, Card> = {}
    const total = ARCHIVED_CARD_CAP + 25
    for (let i = 0; i < total; i++) {
      // i=0 is the oldest (largest ageMsAgo), i=total-1 the newest.
      taskCards[`a${i}`] = archivedCard(`a${i}`, (total - i) * 1000)
    }
    await seedPlanner({ clerkUserId: 'cap_over', taskCards })
    setAuthUser('cap_over')

    const { status } = await invokeRoute(GET)
    expect(status).toBe(200)

    const stored = await getPlanner('cap_over')
    const tc = stored!.taskCards as unknown as Record<string, Card>
    const remaining = Object.keys(tc)
    expect(remaining).toHaveLength(ARCHIVED_CARD_CAP)

    // The 25 oldest (a0..a24) are gone; the 200 newest (a25..a224) retained.
    for (let i = 0; i < 25; i++) {
      expect(tc[`a${i}`]).toBeUndefined()
    }
    for (let i = 25; i < total; i++) {
      expect(tc[`a${i}`]).toBeDefined()
    }
  })

  it('newly-archived completed cards count toward the cap and get archivedAt set', async () => {
    const taskCards: Record<string, Card> = {}
    // Cap-1 existing archived cards, all older than "now".
    for (let i = 0; i < ARCHIVED_CARD_CAP - 1; i++) {
      taskCards[`a${i}`] = archivedCard(`a${i}`, (ARCHIVED_CARD_CAP - i) * 1000)
    }
    // Two freshly completed cards -> archived this read -> total cap+1 -> purge 1.
    taskCards['fresh1'] = {
      id: 'fresh1',
      title: 'f1',
      category: 'cat1',
      content: '',
      status: 'completed',
      subTasks: [],
    }
    taskCards['fresh2'] = {
      id: 'fresh2',
      title: 'f2',
      category: 'cat1',
      content: '',
      status: 'completed',
      subTasks: [],
    }
    await seedPlanner({
      clerkUserId: 'cap_fresh',
      columns: { col1: { id: 'col1', name: 'C', taskCards: ['fresh1', 'fresh2'] } },
      taskCards,
    })
    setAuthUser('cap_fresh')

    const { status, body } = await invokeRoute<{ taskCards: Record<string, Card> }>(GET)
    expect(status).toBe(200)
    // Freshly archived cards are not returned (only 'created' are).
    expect(body.taskCards.fresh1).toBeUndefined()
    expect(body.taskCards.fresh2).toBeUndefined()

    const stored = await getPlanner('cap_fresh')
    const tc = stored!.taskCards as unknown as Record<string, Card>
    expect(Object.keys(tc)).toHaveLength(ARCHIVED_CARD_CAP)
    // The fresh cards are the most recent -> retained, with archivedAt stamped.
    expect(tc.fresh1.status).toBe('archived')
    expect(tc.fresh1.archivedAt).toBeDefined()
    expect(tc.fresh2.archivedAt).toBeDefined()
    // The single oldest pre-existing card (a0) was purged.
    expect(tc.a0).toBeUndefined()
    // Purged ids are removed from columns too.
    const cols = stored!.columns as unknown as Record<string, { taskCards: string[] }>
    expect(cols.col1.taskCards).toEqual([])
  })

  it('legacy archived cards without archivedAt sort oldest and are purged first', async () => {
    const taskCards: Record<string, Card> = {}
    // 2 legacy archived (no archivedAt) — must be purged before any dated card.
    taskCards['legacy1'] = {
      id: 'legacy1',
      title: 'l1',
      category: 'cat1',
      content: '',
      status: 'archived',
      subTasks: [],
    }
    taskCards['legacy2'] = {
      id: 'legacy2',
      title: 'l2',
      category: 'cat1',
      content: '',
      status: 'archived',
      subTasks: [],
    }
    // Cap dated archived cards, all newer than epoch.
    for (let i = 0; i < ARCHIVED_CARD_CAP; i++) {
      taskCards[`d${i}`] = archivedCard(`d${i}`, (ARCHIVED_CARD_CAP - i) * 1000)
    }
    await seedPlanner({ clerkUserId: 'cap_legacy', taskCards })
    setAuthUser('cap_legacy')

    const { status } = await invokeRoute(GET)
    expect(status).toBe(200)

    const stored = await getPlanner('cap_legacy')
    const tc = stored!.taskCards as unknown as Record<string, Card>
    expect(Object.keys(tc)).toHaveLength(ARCHIVED_CARD_CAP)
    // Both legacy (undated => oldest) purged; all dated cards survive.
    expect(tc.legacy1).toBeUndefined()
    expect(tc.legacy2).toBeUndefined()
    for (let i = 0; i < ARCHIVED_CARD_CAP; i++) {
      expect(tc[`d${i}`]).toBeDefined()
    }
  })

  it('does not touch created cards while purging archived ones', async () => {
    const taskCards: Record<string, Card> = {}
    taskCards['keep1'] = createdCard('keep1')
    taskCards['keep2'] = createdCard('keep2')
    for (let i = 0; i < ARCHIVED_CARD_CAP + 5; i++) {
      taskCards[`a${i}`] = archivedCard(`a${i}`, (ARCHIVED_CARD_CAP + 5 - i) * 1000)
    }
    await seedPlanner({
      clerkUserId: 'cap_created',
      columns: { col1: { id: 'col1', name: 'C', taskCards: ['keep1', 'keep2'] } },
      taskCards,
    })
    setAuthUser('cap_created')

    const { status, body } = await invokeRoute<{ taskCards: Record<string, Card> }>(GET)
    expect(status).toBe(200)
    // Created cards still returned, untouched.
    expect(Object.keys(body.taskCards).sort()).toEqual(['keep1', 'keep2'])

    const stored = await getPlanner('cap_created')
    const tc = stored!.taskCards as unknown as Record<string, Card>
    expect(tc.keep1.status).toBe('created')
    expect(tc.keep2.status).toBe('created')
    const cols = stored!.columns as unknown as Record<string, { taskCards: string[] }>
    expect(cols.col1.taskCards).toEqual(['keep1', 'keep2'])
  })

  it('BSON soft limit: aggressively purges down to the aggressive cap when the doc nears 16MB', async () => {
    // Seed a doc that is over the 15MB soft limit but still under the 16MB BSON
    // hard limit (so the insert itself succeeds): 54 cards * ~285KB ~= 15.4MB.
    // The guard must then drop the effective cap to BSON_AGGRESSIVE_CAP (50)
    // and purge the oldest down to it.
    const big = 'x'.repeat(285 * 1024)
    const taskCards: Record<string, Card> = {}
    const total = 54
    for (let i = 0; i < total; i++) {
      taskCards[`a${i}`] = archivedCard(`a${i}`, (total - i) * 1000, big)
    }
    await seedPlanner({ clerkUserId: 'bson_big', taskCards })
    setAuthUser('bson_big')

    const { status } = await invokeRoute(GET)
    expect(status).toBe(200)

    const stored = await getPlanner('bson_big')
    const tc = stored!.taskCards as unknown as Record<string, Card>
    expect(Object.keys(tc)).toHaveLength(BSON_AGGRESSIVE_CAP)
    // Oldest (total - 50) purged; newest 50 retained.
    for (let i = 0; i < total - BSON_AGGRESSIVE_CAP; i++) {
      expect(tc[`a${i}`]).toBeUndefined()
    }
    for (let i = total - BSON_AGGRESSIVE_CAP; i < total; i++) {
      expect(tc[`a${i}`]).toBeDefined()
    }
  })
})
