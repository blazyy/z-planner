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
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// The harness import above registers the clerk + dbConnect mocks; the route
// must be imported afterwards so it binds to them.
import { GET } from './route'

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(resetDb)
afterEach(clearAuthUser)

describe('GET /api/planner (harness smoke test)', () => {
  it('authed first load upserts an empty planner and returns the normalized shape', async () => {
    setAuthUser('user_smoke_1')

    const { status, body } = await invokeRoute<Record<string, unknown>>(GET)

    expect(status).toBe(200)
    // Normalized shape the client (fetchPlannerData) destructures.
    expect(body.boardOrder).toEqual([])
    expect(body.boards).toEqual({})
    expect(body.columns).toEqual({})
    expect(body.categories).toEqual({})
    expect(body.taskCards).toEqual({})
    expect(body.subTasks).toEqual({})

    // The upsert actually persisted a doc for this tenant.
    const stored = await getPlanner('user_smoke_1')
    expect(stored).not.toBeNull()
    expect(stored?.clerkUserId).toBe('user_smoke_1')
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
