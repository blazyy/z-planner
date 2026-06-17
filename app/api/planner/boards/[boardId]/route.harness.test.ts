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
const BOARD_B = 'bbbbbbbbbbbbbbbbb'
const COL_1 = 'ccccccccccccccccc'
const COL_2 = 'ddddddddddddddddd'
const CARD_CREATED = 'eeeeeeeeeeeeeeeee'
const CARD_ARCHIVED = 'fffffffffffffffff'
const SUBTASK_1 = 'ggggggggggggggggg'
const CAT_1 = 'hhhhhhhhhhhhhhhhh'

beforeAll(startMemoryMongo)
afterAll(stopMemoryMongo)
beforeEach(resetDb)
afterEach(clearAuthUser)

type BoardSlice = {
  board: { id: string; name: string; columns: string[]; categories: string[] }
  columns: Record<string, { id: string; name: string; taskCards: string[] }>
  categories: Record<string, { id: string; name: string; color: string }>
  taskCards: Record<string, { id: string; status: string; subTasks: string[] }>
  subTasks: Record<string, { id: string; title: string }>
}

function seedFullBoard(clerkUserId: string) {
  return seedPlanner({
    clerkUserId,
    boardOrder: [BOARD_A],
    boards: {
      [BOARD_A]: { id: BOARD_A, name: 'Work', columns: [COL_1, COL_2], categories: [CAT_1] },
    },
    columns: {
      [COL_1]: { id: COL_1, name: 'Todo', taskCards: [CARD_CREATED, CARD_ARCHIVED] },
      [COL_2]: { id: COL_2, name: 'Done', taskCards: [] },
    },
    categories: {
      [CAT_1]: { id: CAT_1, name: 'General', color: 'blue' },
    },
    taskCards: {
      [CARD_CREATED]: {
        id: CARD_CREATED,
        title: 'Active',
        category: CAT_1,
        content: '',
        status: 'created',
        subTasks: [SUBTASK_1],
      },
      [CARD_ARCHIVED]: {
        id: CARD_ARCHIVED,
        title: 'Old',
        category: CAT_1,
        content: '',
        status: 'archived',
        subTasks: [],
      },
    },
    subTasks: {
      [SUBTASK_1]: { id: SUBTASK_1, title: 'step', checked: false },
    },
  })
}

describe('GET /api/planner/boards/[boardId]', () => {
  it('returns the correctly-scoped board slice for the owner', async () => {
    await seedFullBoard('user_board_1')
    setAuthUser('user_board_1')

    const { status, body } = await invokeRoute<BoardSlice>(GET, { params: { boardId: BOARD_A } })

    expect(status).toBe(200)
    expect(body.board).toEqual({ id: BOARD_A, name: 'Work', columns: [COL_1, COL_2], categories: [CAT_1] })

    // Columns present in board order.
    expect(Object.keys(body.columns)).toEqual([COL_1, COL_2])

    // Only the 'created' card is returned; the archived one is filtered out.
    expect(Object.keys(body.taskCards)).toEqual([CARD_CREATED])
    expect(body.taskCards[CARD_CREATED].status).toBe('created')

    // Subtasks of included cards only.
    expect(Object.keys(body.subTasks)).toEqual([SUBTASK_1])

    // The board's categories.
    expect(body.categories).toEqual({ [CAT_1]: { id: CAT_1, name: 'General', color: 'blue' } })

    // Pure read — the archived card is NOT mutated and nothing is removed.
    const stored = await getPlanner('user_board_1')
    expect(stored?.taskCards?.[CARD_ARCHIVED]?.status).toBe('archived')
    expect(stored?.columns?.[COL_1]?.taskCards).toEqual([CARD_CREATED, CARD_ARCHIVED])
  })

  it('404s for a board id belonging to another tenant', async () => {
    // BOARD_B exists, but for a different user.
    await seedPlanner({
      clerkUserId: 'user_board_other',
      boardOrder: [BOARD_B],
      boards: { [BOARD_B]: { id: BOARD_B, name: 'Theirs', columns: [], categories: [] } },
    })
    // Caller is a different tenant with their own (empty) doc.
    await seedPlanner({ clerkUserId: 'user_board_2' })
    setAuthUser('user_board_2')

    const { status, body } = await invokeRoute<{ error: string }>(GET, { params: { boardId: BOARD_B } })

    expect(status).toBe(404)
    expect(body).toEqual({ error: 'Board not found' })

    // The other tenant's board is untouched.
    const other = await getPlanner('user_board_other')
    expect(other?.boards?.[BOARD_B]).toBeTruthy()
  })

  it('401s when unauthenticated', async () => {
    clearAuthUser()
    const { status, body } = await invokeRoute<{ error: string }>(GET, { params: { boardId: BOARD_A } })
    expect(status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})
