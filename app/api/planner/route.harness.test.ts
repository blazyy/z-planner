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

// Shape the client (fetchPlannerData) destructures.
type Planner = {
  boardOrder: string[]
  boards: Record<string, { id: string; name: string; columns: string[]; categories: string[] }>
  columns: Record<string, { id: string; name: string; taskCards: string[] }>
  categories: Record<string, { id: string; name: string; color: string }>
  taskCards: Record<string, { id: string; title: string; category: string; status: string; subTasks: string[] }>
  subTasks: Record<string, { id: string; title: string; checked: boolean }>
}

const ENTITY_ID = /^[0-9a-z]{17}$/

describe('GET /api/planner (harness smoke test)', () => {
  it('seeds a brand-new user with a starter board on first load', async () => {
    setAuthUser('user_smoke_1')

    const { status, body } = await invokeRoute<Planner>(GET)

    expect(status).toBe(200)

    // Exactly one board, ordered.
    expect(body.boardOrder).toHaveLength(1)
    const boardId = body.boardOrder[0]
    expect(boardId).toMatch(ENTITY_ID)

    const board = body.boards[boardId]
    expect(board.name).toBe('My First Board')
    // Three columns: To Do / In Progress / Done.
    expect(board.columns).toHaveLength(3)
    const columnNames = board.columns.map((id) => body.columns[id].name)
    expect(columnNames).toEqual(['To Do', 'In Progress', 'Done'])
    board.columns.forEach((id) => expect(id).toMatch(ENTITY_ID))

    // The default 'unassigned' category is referenced and present.
    expect(board.categories).toEqual(['unassigned'])
    expect(body.categories.unassigned).toMatchObject({ id: 'unassigned', name: 'Unassigned' })

    // Sample cards live in the first ("To Do") column; the rest are empty.
    const [todo, inProgress, done] = board.columns
    expect(body.columns[todo].taskCards).toHaveLength(2)
    expect(body.columns[inProgress].taskCards).toEqual([])
    expect(body.columns[done].taskCards).toEqual([])
    body.columns[todo].taskCards.forEach((id) => {
      expect(id).toMatch(ENTITY_ID)
      const card = body.taskCards[id]
      expect(card.status).toBe('created')
      expect(card.category).toBe('unassigned')
    })

    // The starter doc was actually persisted for this tenant.
    const stored = await getPlanner('user_smoke_1')
    expect(stored).not.toBeNull()
    expect(stored?.clerkUserId).toBe('user_smoke_1')
    expect(stored?.boardOrder).toHaveLength(1)
  })

  it('does NOT duplicate or reset the starter board on a second load', async () => {
    setAuthUser('user_smoke_seed_twice')

    const first = await invokeRoute<Planner>(GET)
    const second = await invokeRoute<Planner>(GET)

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)

    // Same single board, same ids — no reseed, no duplication.
    expect(second.body.boardOrder).toEqual(first.body.boardOrder)
    expect(Object.keys(second.body.boards)).toEqual(Object.keys(first.body.boards))
    expect(Object.keys(second.body.columns)).toEqual(Object.keys(first.body.columns))
    expect(Object.keys(second.body.taskCards)).toEqual(Object.keys(first.body.taskCards))

    const stored = await getPlanner('user_smoke_seed_twice')
    expect(stored?.boardOrder).toHaveLength(1)
  })

  it('leaves an existing user with data untouched (never reseeds)', async () => {
    await seedPlanner({
      clerkUserId: 'user_smoke_existing',
      boardOrder: ['board1'],
      boards: { board1: { id: 'board1', name: 'Work', columns: [], categories: [] } },
    })
    setAuthUser('user_smoke_existing')

    const { status, body } = await invokeRoute<Planner>(GET)

    expect(status).toBe(200)
    // No starter board injected; the existing single empty board is preserved.
    expect(body.boardOrder).toEqual(['board1'])
    expect(body.boards).toEqual({ board1: { id: 'board1', name: 'Work', columns: [], categories: [] } })
    expect(body.columns).toEqual({})
    expect(body.taskCards).toEqual({})
  })

  it('returns an existing tenant doc without clobbering its data', async () => {
    await seedPlanner({
      clerkUserId: 'user_smoke_2',
      boardOrder: ['board1'],
      boards: { board1: { id: 'board1', name: 'Work', columns: [], categories: [] } },
    })
    setAuthUser('user_smoke_2')

    const { status, body } = await invokeRoute<Record<string, unknown>>(GET)

    expect(status).toBe(200)
    expect(body.boardOrder).toEqual(['board1'])
    expect(body.boards).toEqual({ board1: { id: 'board1', name: 'Work', columns: [], categories: [] } })
  })

  it('401s when unauthenticated', async () => {
    clearAuthUser()
    const { status, body } = await invokeRoute<{ error: string }>(GET)
    expect(status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})
