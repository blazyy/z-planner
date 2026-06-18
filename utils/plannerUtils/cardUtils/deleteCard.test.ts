import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PlannerAction, TaskCardInfoType } from '@/hooks/Planner/types'

/*
 * Pure-logic pins for deleteCard + restoreCard (the onboard-5 undo). We mock
 * axios + sendMutation so we can capture both the dispatched optimistic action
 * and the request the util fires. deleteCard must stay an immediate
 * delete-dispatch + DELETE; restoreCard must re-create the card at its original
 * index with the SAME id, mirroring addNewCardToColumn's POST.
 */

vi.mock('axios', () => ({
  default: { post: vi.fn(), patch: vi.fn(), delete: vi.fn(), get: vi.fn() },
}))
// sendMutation just runs the request immediately here so we can inspect the call.
vi.mock('../apiClient', () => ({
  sendMutation: (_dispatch: unknown, request: () => Promise<unknown>) => {
    request()
  },
}))

import deleteCard, { restoreCard } from './deleteCard'

const axiosMock = (await import('axios')).default

const card = (id: string, overrides: Partial<TaskCardInfoType> = {}): TaskCardInfoType => ({
  id,
  title: 'Title',
  category: 'cat1',
  content: 'body',
  status: 'created',
  subTasks: [],
  ...overrides,
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('deleteCard', () => {
  it('optimistically removes the card and fires the DELETE', () => {
    const dispatched: PlannerAction[] = []
    const dispatch = (a: PlannerAction) => dispatched.push(a)

    deleteCard('col1', 'card2', dispatch, 'board1')

    expect(dispatched).toEqual([{ type: 'taskCardDeleted', payload: { columnId: 'col1', taskCardId: 'card2' } }])
    expect(vi.mocked(axiosMock.delete)).toHaveBeenCalledWith('/api/planner/columns/col1/cards/card2')
  })
})

describe('restoreCard', () => {
  it('re-inserts the card at its original index and POSTs it back with the same id', () => {
    const dispatched: PlannerAction[] = []
    const dispatch = (a: PlannerAction) => dispatched.push(a)
    const deleted = card('card2', { title: 'Restore me', subTasks: ['s1'] })

    // Column order AS IT IS NOW (card2 already removed); card2 was at index 1.
    restoreCard('col1', deleted, 1, ['card1', 'card3'], dispatch, 'board1')

    const action = dispatched[0]
    expect(action.type).toBe('newTaskCardAdded')
    if (action.type !== 'newTaskCardAdded') throw new Error('wrong action')
    expect(action.payload.columnId).toBe('col1')
    expect(action.payload.newTaskCardDetails).toEqual(deleted)
    // Spliced back at index 1, preserving original order.
    expect(action.payload.updatedTaskCards).toEqual(['card1', 'card2', 'card3'])

    // Re-create mirrors addNewCardToColumn's POST, with the ORIGINAL id + data.
    expect(vi.mocked(axiosMock.post)).toHaveBeenCalledWith('/api/planner/columns/col1/cards', {
      newTaskCardDetails: deleted,
      updatedTaskCards: ['card1', 'card2', 'card3'],
    })
  })

  it('inserts at the front when the card was at index 0', () => {
    const dispatch = vi.fn()
    restoreCard('col1', card('cardA'), 0, ['cardB', 'cardC'], dispatch, 'board1')
    expect(vi.mocked(axiosMock.post)).toHaveBeenCalledWith('/api/planner/columns/col1/cards', {
      newTaskCardDetails: card('cardA'),
      updatedTaskCards: ['cardA', 'cardB', 'cardC'],
    })
  })

  it('clamps to the tail when the original index now exceeds the current length', () => {
    const dispatched: PlannerAction[] = []
    const dispatch = (a: PlannerAction) => dispatched.push(a)

    // Original index 5, but only one card remains now: clamp to the end.
    restoreCard('col1', card('cardX'), 5, ['cardY'], dispatch, 'board1')

    const action = dispatched[0]
    if (action.type !== 'newTaskCardAdded') throw new Error('wrong action')
    expect(action.payload.updatedTaskCards).toEqual(['cardY', 'cardX'])
  })
})
