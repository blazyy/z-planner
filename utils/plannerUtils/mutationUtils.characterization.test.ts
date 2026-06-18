import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ColumnInfoType, ColumnsType, PlannerAction, TaskCardInfoType } from '@/hooks/Planner/types'

/*
 * Cheap pure-logic pins for the mutation utils. Each util computes an optimistic
 * payload (reordered/inserted id arrays), dispatches it, then fires the matching
 * axios request through sendMutation. We mock axios + sendMutation to capture
 * both the dispatched action and the request the util would send, pinning the
 * client-side transform (front-insert, splice-reorder, completed-card order).
 */

vi.mock('axios', () => ({
  default: { post: vi.fn(), patch: vi.fn(), delete: vi.fn(), get: vi.fn() },
}))
// sendMutation just runs the request immediately here so we can inspect the call.
vi.mock('./apiClient', () => ({
  sendMutation: (_dispatch: unknown, request: () => Promise<unknown>) => {
    request()
  },
}))

import { addNewCardToColumn } from './cardUtils/addNewCardToColumn'
import changeCardCheckedStatus from './cardUtils/changeCardCheckedStatus'
import moveCardWithinColumn from './cardUtils/moveCardWithinColumn'

const axiosMock = (await import('axios')).default

afterEach(() => {
  vi.clearAllMocks()
})

describe('addNewCardToColumn', () => {
  it('builds a created card and prepends its id to the column order', () => {
    const dispatched: PlannerAction[] = []
    const dispatch = (a: PlannerAction) => dispatched.push(a)
    const column: ColumnInfoType = { id: 'col1', name: 'To Do', taskCards: ['card1', 'card2'] }

    addNewCardToColumn(column, { id: 'cardNew', title: 'Title', category: 'cat1', content: 'body' }, dispatch, 'board1')

    const action = dispatched[0]
    expect(action.type).toBe('newTaskCardAdded')
    if (action.type !== 'newTaskCardAdded') throw new Error('wrong action')
    expect(action.payload.columnId).toBe('col1')
    expect(action.payload.updatedTaskCards).toEqual(['cardNew', 'card1', 'card2'])
    const expectedCard: TaskCardInfoType = {
      id: 'cardNew',
      title: 'Title',
      category: 'cat1',
      content: 'body',
      status: 'created',
      subTasks: [],
    }
    expect(action.payload.newTaskCardDetails).toEqual(expectedCard)

    // Mirrored to the server.
    expect(vi.mocked(axiosMock.post)).toHaveBeenCalledWith('/api/planner/columns/col1/cards', {
      newTaskCardDetails: expectedCard,
      updatedTaskCards: ['cardNew', 'card1', 'card2'],
    })
  })
})

describe('moveCardWithinColumn', () => {
  it('splices the card from source to dest index and persists the reorder', () => {
    const dispatched: PlannerAction[] = []
    const dispatch = (a: PlannerAction) => dispatched.push(a)
    const columns: ColumnsType = {
      col1: { id: 'col1', name: 'To Do', taskCards: ['card1', 'card2', 'card3'] },
    }

    // Move card1 (index 0) to index 2.
    moveCardWithinColumn(columns, 'col1', 'card1', 0, 2, dispatch, 'board1')

    const action = dispatched[0]
    expect(action.type).toBe('cardMovedWithinColumn')
    if (action.type !== 'cardMovedWithinColumn') throw new Error('wrong action')
    expect(action.payload.reorderedCardIds).toEqual(['card2', 'card3', 'card1'])
    expect(vi.mocked(axiosMock.patch)).toHaveBeenCalledWith('/api/planner/columns/col1/cards/reorder', {
      reorderedCardIds: ['card2', 'card3', 'card1'],
    })
  })
})

describe('changeCardCheckedStatus', () => {
  it('when checked: moves the card to the end of the order and PATCHes status completed', () => {
    const dispatched: PlannerAction[] = []
    const dispatch = (a: PlannerAction) => dispatched.push(a)

    changeCardCheckedStatus('col1', 'card1', true, ['card1', 'card2', 'card3'], dispatch, 'board1')

    const action = dispatched[0]
    expect(action.type).toBe('taskCardCheckedStatusChanged')
    if (action.type !== 'taskCardCheckedStatusChanged') throw new Error('wrong action')
    expect(action.payload).toEqual({ columnId: 'col1', taskCardId: 'card1', isChecked: true })
    expect(vi.mocked(axiosMock.patch)).toHaveBeenCalledWith('/api/planner/cards/card1', {
      status: 'completed',
      columnId: 'col1',
      taskCardOrder: ['card2', 'card3', 'card1'],
    })
  })

  it('when unchecked: PATCHes status created with no column reorder payload', () => {
    const dispatch = vi.fn()
    changeCardCheckedStatus('col1', 'card1', false, ['card1', 'card2'], dispatch, 'board1')
    expect(vi.mocked(axiosMock.patch)).toHaveBeenCalledWith('/api/planner/cards/card1', { status: 'created' })
  })
})
