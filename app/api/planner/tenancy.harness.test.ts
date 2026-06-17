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

// Harness import above registers the clerk + dbConnect mocks; routes must be
// imported afterwards so they bind to the mocked auth() / dbConnect().
import { PATCH as boardPatch, DELETE as boardDelete } from './boards/[boardId]/route'
import { DELETE as categoryDelete } from './boards/[boardId]/categories/[categoryId]/route'
import { DELETE as columnDelete } from './boards/[boardId]/columns/[columnId]/route'
import { PATCH as cardPatch } from './cards/[cardId]/route'
import { DELETE as subTaskDelete } from './cards/[cardId]/subtasks/[subTaskId]/route'

/*
 * IDOR / cross-tenant characterization.
 *
 * Every mutating route filters on { clerkUserId: userId, <entity>.id: <id> }.
 * These tests pin that a request authenticated as tenant B, but targeting
 * tenant A's entity ids, never mutates A's data — the updateOne matchedCount is
 * 0 so the route 404s, and A's stored doc is byte-for-byte unchanged.
 *
 * Ids must satisfy entityId regex (^[0-9a-z]{17}$); 'unassigned' is the one
 * allowed literal category id.
 */

// Pad/format a label into a valid 17-char [0-9a-z] entity id.
function id(label: string): string {
  const cleaned = label.toLowerCase().replace(/[^0-9a-z]/g, '')
  return (cleaned + '0'.repeat(17)).slice(0, 17)
}

const aUser = 'user_tenant_a'
const bUser = 'user_tenant_b'

const aBoard = id('aboard')
const aColumn = id('acolumn')
const aCard = id('acard')
const aSub = id('asub')
const aCategory = id('acategory')

const bBoard = id('bboard')

/** Seed tenant A with a fully nested, self-consistent planner. */
async function seedTenantA() {
  await seedPlanner({
    clerkUserId: aUser,
    boardOrder: [aBoard],
    boards: { [aBoard]: { id: aBoard, name: 'A Board', columns: [aColumn], categories: ['unassigned', aCategory] } },
    columns: { [aColumn]: { id: aColumn, name: 'A Column', taskCards: [aCard] } },
    categories: {
      unassigned: { id: 'unassigned', name: 'Unassigned', color: 'slate' },
      [aCategory]: { id: aCategory, name: 'A Cat', color: 'red' },
    },
    taskCards: {
      [aCard]: { id: aCard, title: 'A Card', category: aCategory, content: '', status: 'created', subTasks: [aSub] },
    },
    subTasks: { [aSub]: { id: aSub, title: 'A Sub', checked: false } },
  })
}

/** Seed tenant B with its own board so B is authenticated against a real doc. */
async function seedTenantB() {
  await seedPlanner({
    clerkUserId: bUser,
    boardOrder: [bBoard],
    boards: { [bBoard]: { id: bBoard, name: 'B Board', columns: [], categories: ['unassigned'] } },
    categories: { unassigned: { id: 'unassigned', name: 'Unassigned', color: 'slate' } },
  })
}

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(resetDb)
afterEach(clearAuthUser)

describe('tenancy / IDOR (no cross-tenant mutation)', () => {
  describe('PATCH /api/planner/boards/[boardId]', () => {
    it('B targeting A board -> 404, A unchanged', async () => {
      await seedTenantA()
      await seedTenantB()
      const before = await getPlanner(aUser)

      setAuthUser(bUser)
      const { status } = await invokeRoute(boardPatch, {
        method: 'PATCH',
        params: { boardId: aBoard },
        body: { newName: 'hijacked' },
      })

      expect(status).toBe(404)
      const after = await getPlanner(aUser)
      expect(after?.boards).toEqual(before?.boards)
    })

    it('unauth -> 401, A unchanged', async () => {
      await seedTenantA()
      const before = await getPlanner(aUser)

      clearAuthUser()
      const { status, body } = await invokeRoute<{ error: string }>(boardPatch, {
        method: 'PATCH',
        params: { boardId: aBoard },
        body: { newName: 'hijacked' },
      })

      expect(status).toBe(401)
      expect(body).toEqual({ error: 'Unauthorized' })
      const after = await getPlanner(aUser)
      expect(after?.boards).toEqual(before?.boards)
    })
  })

  describe('DELETE /api/planner/boards/[boardId]', () => {
    it('B targeting A board -> 404, A board still present', async () => {
      await seedTenantA()
      await seedTenantB()
      const before = await getPlanner(aUser)

      setAuthUser(bUser)
      const { status } = await invokeRoute(boardDelete, {
        method: 'DELETE',
        params: { boardId: aBoard },
      })

      expect(status).toBe(404)
      const after = await getPlanner(aUser)
      expect(after?.boards?.[aBoard]).toBeDefined()
      expect(after?.boardOrder).toEqual(before?.boardOrder)
    })

    it('unauth -> 401, A board still present', async () => {
      await seedTenantA()

      clearAuthUser()
      const { status } = await invokeRoute(boardDelete, {
        method: 'DELETE',
        params: { boardId: aBoard },
      })

      expect(status).toBe(401)
      const after = await getPlanner(aUser)
      expect(after?.boards?.[aBoard]).toBeDefined()
    })
  })

  describe('DELETE /api/planner/boards/[boardId]/columns/[columnId]', () => {
    it('B targeting A column -> 404, A column + cards + subtasks intact', async () => {
      await seedTenantA()
      await seedTenantB()
      const before = await getPlanner(aUser)

      setAuthUser(bUser)
      const { status } = await invokeRoute(columnDelete, {
        method: 'DELETE',
        params: { boardId: bBoard, columnId: aColumn },
      })

      // B owns bBoard but not aColumn; planner lookup finds B's doc, column absent -> 404.
      expect(status).toBe(404)
      const after = await getPlanner(aUser)
      expect(after?.columns).toEqual(before?.columns)
      expect(after?.taskCards).toEqual(before?.taskCards)
      expect(after?.subTasks).toEqual(before?.subTasks)
    })

    it('unauth -> 401, A column intact', async () => {
      await seedTenantA()

      clearAuthUser()
      const { status } = await invokeRoute(columnDelete, {
        method: 'DELETE',
        params: { boardId: aBoard, columnId: aColumn },
      })

      expect(status).toBe(401)
      const after = await getPlanner(aUser)
      expect(after?.columns?.[aColumn]).toBeDefined()
    })
  })

  describe('PATCH /api/planner/cards/[cardId]', () => {
    it('B targeting A card -> 404, A card unchanged', async () => {
      await seedTenantA()
      await seedTenantB()
      const before = await getPlanner(aUser)

      setAuthUser(bUser)
      const { status } = await invokeRoute(cardPatch, {
        method: 'PATCH',
        params: { cardId: aCard },
        body: { title: 'hijacked', content: 'pwned', status: 'archived' },
      })

      expect(status).toBe(404)
      const after = await getPlanner(aUser)
      expect(after?.taskCards).toEqual(before?.taskCards)
    })

    it('unauth -> 401, A card unchanged', async () => {
      await seedTenantA()
      const before = await getPlanner(aUser)

      clearAuthUser()
      const { status } = await invokeRoute(cardPatch, {
        method: 'PATCH',
        params: { cardId: aCard },
        body: { title: 'hijacked' },
      })

      expect(status).toBe(401)
      const after = await getPlanner(aUser)
      expect(after?.taskCards).toEqual(before?.taskCards)
    })
  })

  describe('DELETE /api/planner/boards/[boardId]/categories/[categoryId]', () => {
    it('B targeting A category -> 404, A category + card assignment intact', async () => {
      await seedTenantA()
      await seedTenantB()
      const before = await getPlanner(aUser)

      setAuthUser(bUser)
      const { status } = await invokeRoute(categoryDelete, {
        method: 'DELETE',
        params: { boardId: bBoard, categoryId: aCategory },
      })

      // B's doc lacks aCategory -> 404; A's category and the card's category ref survive.
      expect(status).toBe(404)
      const after = await getPlanner(aUser)
      expect(after?.categories).toEqual(before?.categories)
      expect(after?.taskCards?.[aCard]?.category).toBe(aCategory)
    })

    it('unauth -> 401, A category intact', async () => {
      await seedTenantA()

      clearAuthUser()
      const { status } = await invokeRoute(categoryDelete, {
        method: 'DELETE',
        params: { boardId: aBoard, categoryId: aCategory },
      })

      expect(status).toBe(401)
      const after = await getPlanner(aUser)
      expect(after?.categories?.[aCategory]).toBeDefined()
    })
  })

  describe('DELETE /api/planner/cards/[cardId]/subtasks/[subTaskId]', () => {
    it('B targeting A subtask -> 404, A subtask intact', async () => {
      await seedTenantA()
      await seedTenantB()
      const before = await getPlanner(aUser)

      setAuthUser(bUser)
      const { status } = await invokeRoute(subTaskDelete, {
        method: 'DELETE',
        params: { cardId: aCard, subTaskId: aSub },
      })

      expect(status).toBe(404)
      const after = await getPlanner(aUser)
      expect(after?.subTasks).toEqual(before?.subTasks)
      expect(after?.taskCards?.[aCard]?.subTasks).toEqual(before?.taskCards?.[aCard]?.subTasks)
    })

    it('unauth -> 401, A subtask intact', async () => {
      await seedTenantA()

      clearAuthUser()
      const { status } = await invokeRoute(subTaskDelete, {
        method: 'DELETE',
        params: { cardId: aCard, subTaskId: aSub },
      })

      expect(status).toBe(401)
      const after = await getPlanner(aUser)
      expect(after?.subTasks?.[aSub]).toBeDefined()
    })
  })
})
