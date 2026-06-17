import { describe, expect, it } from 'vitest'

import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'

import { plannerReducer } from './plannerReducer'
import { PlannerType } from './types'

/*
 * Characterization tests complementing plannerReducer.test.ts. The sibling file
 * already covers dataFetchedFromDatabase, board/column/category/card/subtask
 * CRUD, card check/uncheck, cross/within-column moves, and category delete
 * reassignment. This file pins the remaining data actions — column rename — plus
 * exact output shapes and edge cases. Ephemeral UI flags moved out of this
 * reducer and are pinned in ephemeralReducer.test.ts.
 */

const baseState = (): PlannerType => ({
  boardOrder: ['board1'],
  boards: {
    board1: { id: 'board1', name: 'Work', columns: ['col1', 'col2'], categories: [UNASSIGNED_CATEGORY_ID, 'cat1'] },
  },
  columns: {
    col1: { id: 'col1', name: 'To Do', taskCards: ['card1', 'card2', 'card3'] },
    col2: { id: 'col2', name: 'Done', taskCards: [] },
  },
  categories: {
    [UNASSIGNED_CATEGORY_ID]: { id: UNASSIGNED_CATEGORY_ID, name: 'Unassigned', color: 'slate' },
    cat1: { id: 'cat1', name: 'Deep work', color: 'blue' },
  },
  taskCards: {
    card1: { id: 'card1', title: 'One', category: 'cat1', content: '', status: 'created', subTasks: ['sub1'] },
    card2: {
      id: 'card2',
      title: 'Two',
      category: UNASSIGNED_CATEGORY_ID,
      content: '',
      status: 'created',
      subTasks: [],
    },
    card3: { id: 'card3', title: 'Three', category: 'cat1', content: '', status: 'created', subTasks: [] },
  },
  subTasks: {
    sub1: { id: 'sub1', title: 'Step one', checked: false },
  },
})

describe('plannerReducer — column rename (gap)', () => {
  it('renames a column in place, leaving its task order and id untouched', () => {
    const next = plannerReducer(baseState(), {
      type: 'columnNameChanged',
      payload: { columnId: 'col1', newName: 'In Progress' },
    })
    expect(next.columns.col1).toEqual({ id: 'col1', name: 'In Progress', taskCards: ['card1', 'card2', 'card3'] })
    // Other columns untouched.
    expect(next.columns.col2).toEqual({ id: 'col2', name: 'Done', taskCards: [] })
  })
})

describe('plannerReducer — card check reorder edge cases (pinning current behavior)', () => {
  it('checking the FIRST card moves it to the end and marks it completed', () => {
    const next = plannerReducer(baseState(), {
      type: 'taskCardCheckedStatusChanged',
      payload: { columnId: 'col1', taskCardId: 'card1', isChecked: true },
    })
    expect(next.taskCards.card1.status).toBe('completed')
    expect(next.columns.col1.taskCards).toEqual(['card2', 'card3', 'card1'])
  })

  it('checking the ALREADY-LAST card keeps the order stable (splice out then back to end)', () => {
    const next = plannerReducer(baseState(), {
      type: 'taskCardCheckedStatusChanged',
      payload: { columnId: 'col1', taskCardId: 'card3', isChecked: true },
    })
    expect(next.taskCards.card3.status).toBe('completed')
    expect(next.columns.col1.taskCards).toEqual(['card1', 'card2', 'card3'])
  })

  it('unchecking only flips status back to created and never reorders', () => {
    const checked = plannerReducer(baseState(), {
      type: 'taskCardCheckedStatusChanged',
      payload: { columnId: 'col1', taskCardId: 'card1', isChecked: true },
    })
    // After check, order is [card2, card3, card1].
    const next = plannerReducer(checked, {
      type: 'taskCardCheckedStatusChanged',
      payload: { columnId: 'col1', taskCardId: 'card1', isChecked: false },
    })
    expect(next.taskCards.card1.status).toBe('created')
    expect(next.columns.col1.taskCards).toEqual(['card2', 'card3', 'card1'])
  })
})

describe('plannerReducer — exact-shape pins for already-tested actions', () => {
  it('newTaskCardAdded writes the full card object verbatim into the map', () => {
    const card = {
      id: 'card4',
      title: 'Four',
      category: 'cat1',
      content: 'body',
      status: 'created' as const,
      subTasks: [],
    }
    const next = plannerReducer(baseState(), {
      type: 'newTaskCardAdded',
      payload: { columnId: 'col2', newTaskCardDetails: card, updatedTaskCards: ['card4'] },
    })
    expect(next.taskCards.card4).toEqual(card)
    expect(next.columns.col2.taskCards).toEqual(['card4'])
  })

  it('newSubTaskAdded writes the subtask verbatim and replaces the parent ordering', () => {
    const next = plannerReducer(baseState(), {
      type: 'newSubTaskAdded',
      payload: {
        taskCardId: 'card1',
        newSubTaskDetails: { id: 'sub2', title: '', checked: false },
        newSubTasksOrder: ['sub1', 'sub2'],
      },
    })
    expect(next.subTasks.sub2).toEqual({ id: 'sub2', title: '', checked: false })
    expect(next.taskCards.card1.subTasks).toEqual(['sub1', 'sub2'])
  })
})

describe('plannerReducer — immutability of source state (immer)', () => {
  it('does not mutate prior state across a representative spread of actions', () => {
    const actions = [
      { type: 'columnNameChanged', payload: { columnId: 'col1', newName: 'X' } },
      { type: 'taskCardCheckedStatusChanged', payload: { columnId: 'col1', taskCardId: 'card1', isChecked: true } },
      {
        type: 'newCategoryAdded',
        payload: { boardId: 'board1', newCategoryDetails: { id: 'cat2', name: 'C', color: 'red' } },
      },
    ] as const

    for (const action of actions) {
      const before = baseState()
      const frozen = structuredClone(before)
      plannerReducer(before, action)
      expect(before).toEqual(frozen)
    }
  })
})
