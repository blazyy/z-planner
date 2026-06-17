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
import { DELETE as boardDelete } from './boards/[boardId]/route'
import { DELETE as categoryDelete } from './boards/[boardId]/categories/[categoryId]/route'
import { DELETE as columnDelete } from './boards/[boardId]/columns/[columnId]/route'
import { DELETE as subTaskDelete } from './cards/[cardId]/subtasks/[subTaskId]/route'

/*
 * Cascade-delete characterization. Pins CURRENT behavior of the four delete
 * handlers against a deeply nested seed:
 *   board -> columns -> cards -> subtasks, plus board categories.
 * Also exercises the category-delete reassignment (bug-2 atomicity guard):
 * deleting a category must reassign its cards to UNASSIGNED in the same update.
 *
 * Ids must satisfy entityId regex (^[0-9a-z]{17}$); 'unassigned' is the one
 * allowed literal category id.
 */

const UNASSIGNED = 'unassigned'
const user = 'user_cascade'

// Pad a label into a valid 17-char [0-9a-z] entity id.
function id(label: string): string {
  const cleaned = label.toLowerCase().replace(/[^0-9a-z]/g, '')
  return (cleaned + '0'.repeat(17)).slice(0, 17)
}

const boardA = id('boarda')
const boardB = id('boardb')
const colA1 = id('cola1')
const colA2 = id('cola2')
const colB1 = id('colb1')
const cardA1 = id('carda1')
const cardA2 = id('carda2')
const cardB1 = id('cardb1')
const subA1 = id('suba1')
const subA2 = id('suba2')
const subB1 = id('subb1')
const catA = id('cata')

/**
 * Seed a two-board planner. boardA: 2 columns; colA1 has 1 card (2 subtasks),
 * colA2 has 1 card (no subtasks). boardB: 1 column, 1 card (1 subtask).
 * cardA1 uses category catA (board-local); everything else uses unassigned.
 */
async function seedNested() {
  await seedPlanner({
    clerkUserId: user,
    boardOrder: [boardA, boardB],
    boards: {
      [boardA]: { id: boardA, name: 'A', columns: [colA1, colA2], categories: [UNASSIGNED, catA] },
      [boardB]: { id: boardB, name: 'B', columns: [colB1], categories: [UNASSIGNED] },
    },
    columns: {
      [colA1]: { id: colA1, name: 'A1', taskCards: [cardA1] },
      [colA2]: { id: colA2, name: 'A2', taskCards: [cardA2] },
      [colB1]: { id: colB1, name: 'B1', taskCards: [cardB1] },
    },
    categories: {
      [UNASSIGNED]: { id: UNASSIGNED, name: 'Unassigned', color: 'slate' },
      [catA]: { id: catA, name: 'Cat A', color: 'red' },
    },
    taskCards: {
      [cardA1]: { id: cardA1, title: 'A1c', category: catA, content: '', status: 'created', subTasks: [subA1, subA2] },
      [cardA2]: { id: cardA2, title: 'A2c', category: UNASSIGNED, content: '', status: 'created', subTasks: [] },
      [cardB1]: { id: cardB1, title: 'B1c', category: UNASSIGNED, content: '', status: 'created', subTasks: [subB1] },
    },
    subTasks: {
      [subA1]: { id: subA1, title: 's', checked: false },
      [subA2]: { id: subA2, title: 's', checked: false },
      [subB1]: { id: subB1, title: 's', checked: false },
    },
  })
}

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(resetDb)
afterEach(clearAuthUser)

describe('cascade deletes (current behavior)', () => {
  describe('DELETE board', () => {
    it('removes board, its columns, their cards, those cards subtasks, and board-local categories; spares shared unassigned and other board', async () => {
      await seedNested()
      setAuthUser(user)

      const { status, body } = await invokeRoute<{ deleted: string }>(boardDelete, {
        method: 'DELETE',
        params: { boardId: boardA },
      })

      expect(status).toBe(200)
      expect(body).toEqual({ deleted: boardA })

      const after = await getPlanner(user)
      // board + boardOrder
      expect(after?.boards?.[boardA]).toBeUndefined()
      expect(after?.boardOrder).toEqual([boardB])
      // columns of boardA gone
      expect(after?.columns?.[colA1]).toBeUndefined()
      expect(after?.columns?.[colA2]).toBeUndefined()
      // their cards gone
      expect(after?.taskCards?.[cardA1]).toBeUndefined()
      expect(after?.taskCards?.[cardA2]).toBeUndefined()
      // those cards' subtasks gone
      expect(after?.subTasks?.[subA1]).toBeUndefined()
      expect(after?.subTasks?.[subA2]).toBeUndefined()
      // board-local category gone; shared 'unassigned' kept (other board exists)
      expect(after?.categories?.[catA]).toBeUndefined()
      expect(after?.categories?.[UNASSIGNED]).toBeDefined()
      // boardB and its subtree untouched
      expect(after?.boards?.[boardB]).toBeDefined()
      expect(after?.columns?.[colB1]).toBeDefined()
      expect(after?.taskCards?.[cardB1]).toBeDefined()
      expect(after?.subTasks?.[subB1]).toBeDefined()
    })

    it('removes shared unassigned category when deleting the last board standing', async () => {
      await seedNested()
      setAuthUser(user)

      // Delete boardB first, then boardA is the last board.
      await invokeRoute(boardDelete, { method: 'DELETE', params: { boardId: boardB } })
      const { status } = await invokeRoute(boardDelete, { method: 'DELETE', params: { boardId: boardA } })

      expect(status).toBe(200)
      const after = await getPlanner(user)
      expect(after?.boards).toEqual({})
      expect(after?.boardOrder).toEqual([])
      // last board standing -> shared unassigned category also removed
      expect(after?.categories?.[UNASSIGNED]).toBeUndefined()
      expect(after?.categories?.[catA]).toBeUndefined()
      // everything cascaded away
      expect(after?.columns).toEqual({})
      expect(after?.taskCards).toEqual({})
      expect(after?.subTasks).toEqual({})
    })
  })

  describe('DELETE column', () => {
    it('removes the column, its cards, and those cards subtasks; spares sibling column subtree and board categories', async () => {
      await seedNested()
      setAuthUser(user)

      const { status, body } = await invokeRoute<{ deleted: string }>(columnDelete, {
        method: 'DELETE',
        params: { boardId: boardA, columnId: colA1 },
      })

      expect(status).toBe(200)
      expect(body).toEqual({ deleted: colA1 })

      const after = await getPlanner(user)
      // target column + its card + its subtasks gone
      expect(after?.columns?.[colA1]).toBeUndefined()
      expect(after?.taskCards?.[cardA1]).toBeUndefined()
      expect(after?.subTasks?.[subA1]).toBeUndefined()
      expect(after?.subTasks?.[subA2]).toBeUndefined()
      // pulled from the board's column order
      expect(after?.boards?.[boardA]?.columns).toEqual([colA2])
      // sibling column colA2 + its card survive
      expect(after?.columns?.[colA2]).toBeDefined()
      expect(after?.taskCards?.[cardA2]).toBeDefined()
      // categories untouched by a column delete
      expect(after?.categories?.[catA]).toBeDefined()
      expect(after?.categories?.[UNASSIGNED]).toBeDefined()
    })
  })

  describe('DELETE subtask', () => {
    it('removes only the targeted subtask and its reference in the card subTasks order', async () => {
      await seedNested()
      setAuthUser(user)

      const { status, body } = await invokeRoute<{ deleted: string }>(subTaskDelete, {
        method: 'DELETE',
        params: { cardId: cardA1, subTaskId: subA1 },
      })

      expect(status).toBe(200)
      expect(body).toEqual({ deleted: subA1 })

      const after = await getPlanner(user)
      expect(after?.subTasks?.[subA1]).toBeUndefined()
      // sibling subtask survives, and the card itself survives
      expect(after?.subTasks?.[subA2]).toBeDefined()
      expect(after?.taskCards?.[cardA1]).toBeDefined()
      // order array pulled
      expect(after?.taskCards?.[cardA1]?.subTasks).toEqual([subA2])
    })
  })

  describe('DELETE category (reassign-to-unassigned atomicity — bug-2 guard)', () => {
    it('removes the category, pulls it from the board, and reassigns its cards to unassigned in one update', async () => {
      await seedNested()
      setAuthUser(user)

      const { status, body } = await invokeRoute<{ deleted: string }>(categoryDelete, {
        method: 'DELETE',
        params: { boardId: boardA, categoryId: catA },
      })

      expect(status).toBe(200)
      expect(body).toEqual({ deleted: catA })

      const after = await getPlanner(user)
      // category removed and pulled from the board's category list
      expect(after?.categories?.[catA]).toBeUndefined()
      expect(after?.boards?.[boardA]?.categories).toEqual([UNASSIGNED])
      // the only card using catA is reassigned to unassigned (no orphan ref)
      expect(after?.taskCards?.[cardA1]?.category).toBe(UNASSIGNED)
      // a card that was already unassigned is untouched
      expect(after?.taskCards?.[cardA2]?.category).toBe(UNASSIGNED)
      // cards/columns/subtasks otherwise intact (category delete is not a cascade)
      expect(after?.taskCards?.[cardA1]).toBeDefined()
      expect(after?.subTasks?.[subA1]).toBeDefined()
      expect(after?.subTasks?.[subA2]).toBeDefined()
    })

    it('refuses to delete the default unassigned category (400)', async () => {
      await seedNested()
      setAuthUser(user)

      const { status, body } = await invokeRoute<{ error: string }>(categoryDelete, {
        method: 'DELETE',
        params: { boardId: boardA, categoryId: UNASSIGNED },
      })

      expect(status).toBe(400)
      expect(body.error).toBe('The default category cannot be deleted')
      const after = await getPlanner(user)
      expect(after?.categories?.[UNASSIGNED]).toBeDefined()
    })
  })
})
