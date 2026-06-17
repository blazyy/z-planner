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

// The harness import above registers the clerk + dbConnect mocks; the route
// must be imported afterwards so it binds to them.
import { GET } from './route'

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(resetDb)
afterEach(clearAuthUser)

/*
 * Characterization tests for the write-on-read archive behavior of GET
 * /api/planner. These pin the EXACT current observable contract so that
 * bug-3 (idempotency assessment) and refactor-1 (archived purge) cannot
 * silently change it. They must pass GREEN against the current handler.
 */

type Card = { id: string; title: string; category: string; content: string; status: string; subTasks: string[] }

function card(id: string, status: string, overrides: Partial<Card> = {}): Card {
  return {
    id,
    title: id,
    category: 'cat1',
    content: '',
    status,
    subTasks: [],
    ...overrides,
  }
}

type PlannerBody = {
  taskCards: Record<string, Card>
  columns: Record<string, { id: string; name: string; taskCards: string[] }>
  categories: Record<string, unknown>
  boards: Record<string, unknown>
  boardOrder: string[]
}

describe('GET /api/planner — write-on-read archive characterization', () => {
  it('archives completed cards: status->archived, $pull from column, filtered out of response', async () => {
    await seedPlanner({
      clerkUserId: 'arch_user_1',
      boardOrder: ['b1'],
      boards: { b1: { id: 'b1', name: 'Board', columns: ['col1'], categories: ['cat1'] } },
      categories: { cat1: { id: 'cat1', name: 'Cat', color: '#fff' } },
      columns: { col1: { id: 'col1', name: 'Todo', taskCards: ['t_created', 't_completed'] } },
      taskCards: {
        t_created: card('t_created', 'created'),
        t_completed: card('t_completed', 'completed'),
      },
    })
    setAuthUser('arch_user_1')

    const { status, body } = await invokeRoute<PlannerBody>(GET)

    expect(status).toBe(200)

    // (a) completed card filtered OUT of the response, (b) only 'created' returned
    expect(Object.keys(body.taskCards)).toEqual(['t_created'])
    expect(body.taskCards.t_created.status).toBe('created')
    expect(body.taskCards.t_completed).toBeUndefined()

    // Persisted side effects: completed -> archived, and removed from its column.
    const stored = await getPlanner('arch_user_1')
    const tc = stored!.taskCards as unknown as Record<string, Card>
    const cols = stored!.columns as unknown as Record<string, { taskCards: string[] }>
    expect(tc.t_completed.status).toBe('archived')
    expect(tc.t_created.status).toBe('created')
    // $pull removed the now-archived card from the column ordering.
    expect(cols.col1.taskCards).toEqual(['t_created'])
  })

  it('returns only created cards when a mix of created/completed/archived exists', async () => {
    await seedPlanner({
      clerkUserId: 'arch_user_2',
      columns: { col1: { id: 'col1', name: 'Todo', taskCards: ['c1', 'c2', 'comp1'] } },
      taskCards: {
        c1: card('c1', 'created'),
        c2: card('c2', 'created'),
        comp1: card('comp1', 'completed'),
        old_arch: card('old_arch', 'archived'),
      },
    })
    setAuthUser('arch_user_2')

    const { status, body } = await invokeRoute<PlannerBody>(GET)

    expect(status).toBe(200)
    expect(Object.keys(body.taskCards).sort()).toEqual(['c1', 'c2'])
    // Pre-existing archived cards are never returned.
    expect(body.taskCards.old_arch).toBeUndefined()
    expect(body.taskCards.comp1).toBeUndefined()
  })

  it('is idempotent: a 2nd GET with no new completed cards changes nothing and returns identical data', async () => {
    await seedPlanner({
      clerkUserId: 'arch_user_3',
      columns: { col1: { id: 'col1', name: 'Todo', taskCards: ['k1', 'done1'] } },
      taskCards: {
        k1: card('k1', 'created'),
        done1: card('done1', 'completed'),
      },
    })
    setAuthUser('arch_user_3')

    const first = await invokeRoute<PlannerBody>(GET)
    const afterFirst = await getPlanner('arch_user_3')

    const second = await invokeRoute<PlannerBody>(GET)
    const afterSecond = await getPlanner('arch_user_3')

    // Identical observable response across both reads.
    expect(second.status).toBe(200)
    expect(second.body.taskCards).toEqual(first.body.taskCards)
    expect(Object.keys(second.body.taskCards)).toEqual(['k1'])

    // No further DB mutation on the second read: stored doc is byte-for-byte
    // identical (status map + column ordering unchanged).
    const tc1 = afterFirst!.taskCards as unknown as Record<string, Card>
    const tc2 = afterSecond!.taskCards as unknown as Record<string, Card>
    expect(tc2.done1.status).toBe('archived')
    expect(tc1.done1.status).toBe('archived')
    expect(tc2).toEqual(tc1)

    const cols1 = afterFirst!.columns as unknown as Record<string, { taskCards: string[] }>
    const cols2 = afterSecond!.columns as unknown as Record<string, { taskCards: string[] }>
    expect(cols2.col1.taskCards).toEqual(['k1'])
    expect(cols2).toEqual(cols1)
    // NOTE: updatedAt is intentionally NOT asserted here. The upsert
    // findOneAndUpdate bumps updatedAt on every read (Mongoose injects an
    // updatedAt $set even when only $setOnInsert is present), so the timestamp
    // is not a reliable "no archive write" signal. Idempotency is instead
    // pinned via the archive side effects (taskCards statuses + column
    // ordering) being byte-identical across both reads.
  })

  it('targeted writes preserve other cards and other columns', async () => {
    await seedPlanner({
      clerkUserId: 'arch_user_4',
      columns: {
        col1: { id: 'col1', name: 'Todo', taskCards: ['a1', 'comp1'] },
        col2: { id: 'col2', name: 'Doing', taskCards: ['b1', 'b2'] },
      },
      taskCards: {
        a1: card('a1', 'created', { title: 'keep me', content: 'preserved' }),
        comp1: card('comp1', 'completed'),
        b1: card('b1', 'created'),
        b2: card('b2', 'created'),
      },
    })
    setAuthUser('arch_user_4')

    const { status, body } = await invokeRoute<PlannerBody>(GET)

    expect(status).toBe(200)
    // Response carries every still-created card, untouched.
    expect(Object.keys(body.taskCards).sort()).toEqual(['a1', 'b1', 'b2'])
    expect(body.taskCards.a1.title).toBe('keep me')
    expect(body.taskCards.a1.content).toBe('preserved')

    const stored = await getPlanner('arch_user_4')
    const cols = stored!.columns as unknown as Record<string, { taskCards: string[] }>
    // Only col1 lost its completed card; col2 is fully intact (no $pull issued).
    expect(cols.col1.taskCards).toEqual(['a1'])
    expect(cols.col2.taskCards).toEqual(['b1', 'b2'])

    const tc = stored!.taskCards as unknown as Record<string, Card>
    expect(tc.a1.status).toBe('created')
    expect(tc.b1.status).toBe('created')
    expect(tc.b2.status).toBe('created')
    expect(tc.comp1.status).toBe('archived')
  })

  it('no completed cards: response and stored doc are unchanged, no column $pull', async () => {
    await seedPlanner({
      clerkUserId: 'arch_user_5',
      columns: { col1: { id: 'col1', name: 'Todo', taskCards: ['x1', 'x2'] } },
      taskCards: {
        x1: card('x1', 'created'),
        x2: card('x2', 'created'),
      },
    })
    setAuthUser('arch_user_5')

    const before = await getPlanner('arch_user_5')
    const { status, body } = await invokeRoute<PlannerBody>(GET)
    const after = await getPlanner('arch_user_5')

    expect(status).toBe(200)
    expect(Object.keys(body.taskCards).sort()).toEqual(['x1', 'x2'])
    // No archive write: statuses and column ordering are unchanged. (updatedAt
    // is NOT asserted — see the idempotency test; the upsert always bumps it.)
    const tcBefore = before!.taskCards as unknown as Record<string, Card>
    const tcAfter = after!.taskCards as unknown as Record<string, Card>
    expect(tcAfter).toEqual(tcBefore)
    const colsAfter = after!.columns as unknown as Record<string, { taskCards: string[] }>
    expect(colsAfter.col1.taskCards).toEqual(['x1', 'x2'])
  })
})
