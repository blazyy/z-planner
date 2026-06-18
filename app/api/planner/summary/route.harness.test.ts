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

// Harness import registers the clerk + dbConnect mocks; route imported after.
import { GET } from './route'

// 17-char lowercase alphanumeric ids — the shape entityId validates.
const BOARD_A = 'aaaaaaaaaaaaaaaaa'
const COL_1 = 'ccccccccccccccccc'
const CARD_1 = 'eeeeeeeeeeeeeeeee'
const SUBTASK_1 = 'ggggggggggggggggg'
const CAT_1 = 'hhhhhhhhhhhhhhhhh'

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(resetDb)
afterEach(clearAuthUser)

type Summary = {
  boardOrder: string[]
  boards: Record<string, { id: string; name: string; columns: string[]; categories: string[] }>
  categories: Record<string, { id: string; name: string; color: string }>
}

function seedFull(clerkUserId: string) {
  return seedPlanner({
    clerkUserId,
    boardOrder: [BOARD_A],
    boards: {
      [BOARD_A]: { id: BOARD_A, name: 'Work', columns: [COL_1], categories: [CAT_1] },
    },
    columns: {
      [COL_1]: { id: COL_1, name: 'Todo', taskCards: [CARD_1] },
    },
    categories: {
      [CAT_1]: { id: CAT_1, name: 'General', color: 'blue' },
    },
    taskCards: {
      [CARD_1]: { id: CARD_1, title: 'Active', category: CAT_1, content: '', status: 'created', subTasks: [SUBTASK_1] },
    },
    subTasks: {
      [SUBTASK_1]: { id: SUBTASK_1, title: 'step', checked: false },
    },
  })
}

describe('GET /api/planner/summary', () => {
  it('returns only boardOrder, boards and categories — no heavy slices', async () => {
    await seedFull('user_summary_1')
    setAuthUser('user_summary_1')

    const { status, body } = await invokeRoute<Record<string, unknown>>(GET)

    expect(status).toBe(200)
    expect(body.boardOrder).toEqual([BOARD_A])
    expect(body.boards).toEqual({
      [BOARD_A]: { id: BOARD_A, name: 'Work', columns: [COL_1], categories: [CAT_1] },
    })
    expect(body.categories).toEqual({ [CAT_1]: { id: CAT_1, name: 'General', color: 'blue' } })

    // The heavy slices are deliberately absent from the summary payload.
    expect(body.columns).toBeUndefined()
    expect(body.taskCards).toBeUndefined()
    expect(body.subTasks).toBeUndefined()
  })

  it('authed first load upserts an empty planner and returns the empty summary shape', async () => {
    setAuthUser('user_summary_new')

    const { status, body } = await invokeRoute<Summary>(GET)

    expect(status).toBe(200)
    expect(body.boardOrder).toEqual([])
    expect(body.boards).toEqual({})
    expect(body.categories).toEqual({})

    // The upsert actually persisted a doc for this tenant.
    const stored = await getPlanner('user_summary_new')
    expect(stored).not.toBeNull()
    expect(stored?.clerkUserId).toBe('user_summary_new')
  })

  it('is a pure read — does not archive completed cards (unlike the collection GET)', async () => {
    await seedPlanner({
      clerkUserId: 'user_summary_pure',
      boardOrder: [BOARD_A],
      boards: { [BOARD_A]: { id: BOARD_A, name: 'Work', columns: [COL_1], categories: [CAT_1] } },
      columns: { [COL_1]: { id: COL_1, name: 'Todo', taskCards: [CARD_1] } },
      categories: { [CAT_1]: { id: CAT_1, name: 'General', color: 'blue' } },
      taskCards: {
        [CARD_1]: { id: CARD_1, title: 'Done', category: CAT_1, content: '', status: 'completed', subTasks: [] },
      },
    })
    setAuthUser('user_summary_pure')

    const { status } = await invokeRoute<Summary>(GET)
    expect(status).toBe(200)

    // The completed card is NOT archived by the summary read.
    const stored = await getPlanner('user_summary_pure')
    expect(stored?.taskCards?.[CARD_1]?.status).toBe('completed')
  })

  it('401s when unauthenticated', async () => {
    clearAuthUser()
    const { status, body } = await invokeRoute<{ error: string }>(GET)
    expect(status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})
