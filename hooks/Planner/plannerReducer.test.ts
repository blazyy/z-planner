import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'
import { describe, expect, it } from 'vitest'
import { plannerReducer } from './plannerReducer'
import { PlannerType } from './types'

const baseState = (): PlannerType => ({
  hasLoaded: true,
  isSubTaskBeingDragged: false,
  taskCardBeingInitialized: null,
  dataEnteredInTaskCardBeingInitialized: false,
  boardOrder: ['board1'],
  boards: {
    board1: { id: 'board1', name: 'Work', columns: ['col1', 'col2'], categories: [UNASSIGNED_CATEGORY_ID, 'cat1'] },
  },
  columns: {
    col1: { id: 'col1', name: 'To Do', taskCards: ['card1', 'card2'] },
    col2: { id: 'col2', name: 'Done', taskCards: ['card3'] },
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

describe('plannerReducer', () => {
  it('replaces the whole state on dataFetchedFromDatabase', () => {
    const incoming = { ...baseState(), boardOrder: ['boardX'] }
    const next = plannerReducer(baseState(), { type: 'dataFetchedFromDatabase', payload: incoming })
    expect(next).toEqual(incoming)
  })

  it('adds a board with its unassigned category', () => {
    const next = plannerReducer(baseState(), {
      type: 'newBoardAdded',
      payload: {
        boardId: 'board2',
        boardName: 'Home',
        unassignedCategoryDetails: { id: UNASSIGNED_CATEGORY_ID, name: 'Unassigned', color: 'slate' },
      },
    })
    expect(next.boardOrder).toEqual(['board1', 'board2'])
    expect(next.boards.board2).toEqual({
      id: 'board2',
      name: 'Home',
      columns: [],
      categories: [UNASSIGNED_CATEGORY_ID],
    })
  })

  it('deletes a board from the order and the map', () => {
    const next = plannerReducer(baseState(), { type: 'boardDeleted', payload: { boardId: 'board1' } })
    expect(next.boardOrder).toEqual([])
    expect(next.boards.board1).toBeUndefined()
  })

  it('renames a board', () => {
    const next = plannerReducer(baseState(), {
      type: 'boardNameChanged',
      payload: { boardId: 'board1', newName: 'Life' },
    })
    expect(next.boards.board1.name).toBe('Life')
  })

  it('adds and deletes a column', () => {
    const added = plannerReducer(baseState(), {
      type: 'newColumnAdded',
      payload: {
        boardId: 'board1',
        newColumnDetails: { id: 'col3', name: 'Backlog', taskCards: [] },
        updatedColumns: ['col1', 'col2', 'col3'],
      },
    })
    expect(added.boards.board1.columns).toEqual(['col1', 'col2', 'col3'])
    expect(added.columns.col3.name).toBe('Backlog')

    const deleted = plannerReducer(added, { type: 'columnDeleted', payload: { boardId: 'board1', columnId: 'col3' } })
    expect(deleted.boards.board1.columns).toEqual(['col1', 'col2'])
    expect(deleted.columns.col3).toBeUndefined()
  })

  it('reorders columns wholesale', () => {
    const next = plannerReducer(baseState(), {
      type: 'columnsReordered',
      payload: { boardId: 'board1', newColumnOrder: ['col2', 'col1'] },
    })
    expect(next.boards.board1.columns).toEqual(['col2', 'col1'])
  })

  it('moves a card within a column via the full reordered array', () => {
    const next = plannerReducer(baseState(), {
      type: 'cardMovedWithinColumn',
      payload: { columnId: 'col1', reorderedCardIds: ['card2', 'card1'] },
    })
    expect(next.columns.col1.taskCards).toEqual(['card2', 'card1'])
  })

  it('moves a card across columns via both full arrays', () => {
    const next = plannerReducer(baseState(), {
      type: 'cardMovedAcrossColumns',
      payload: {
        sourceColumnId: 'col1',
        destColumnId: 'col2',
        sourceColumnTaskCardIds: ['card2'],
        destColumnTaskCardIds: ['card1', 'card3'],
      },
    })
    expect(next.columns.col1.taskCards).toEqual(['card2'])
    expect(next.columns.col2.taskCards).toEqual(['card1', 'card3'])
  })

  it('adds a new task card and clears the initialization state', () => {
    const start = {
      ...baseState(),
      taskCardBeingInitialized: { taskCardId: 'card4', columnId: 'col1', isHighlighted: false },
      dataEnteredInTaskCardBeingInitialized: true,
    }
    const next = plannerReducer(start, {
      type: 'newTaskCardAdded',
      payload: {
        columnId: 'col1',
        newTaskCardDetails: {
          id: 'card4',
          title: 'Four',
          category: 'cat1',
          content: '',
          status: 'created',
          subTasks: [],
        },
        updatedTaskCards: ['card4', 'card1', 'card2'],
      },
    })
    expect(next.columns.col1.taskCards).toEqual(['card4', 'card1', 'card2'])
    expect(next.taskCards.card4.title).toBe('Four')
    expect(next.taskCardBeingInitialized).toBeNull()
    expect(next.dataEnteredInTaskCardBeingInitialized).toBe(false)
  })

  it('checking a card marks it completed and moves it to the bottom of its column', () => {
    const next = plannerReducer(baseState(), {
      type: 'taskCardCheckedStatusChanged',
      payload: { columnId: 'col1', taskCardId: 'card1', isChecked: true },
    })
    expect(next.taskCards.card1.status).toBe('completed')
    expect(next.columns.col1.taskCards).toEqual(['card2', 'card1'])
  })

  it('unchecking a card restores created status without reordering', () => {
    const checked = plannerReducer(baseState(), {
      type: 'taskCardCheckedStatusChanged',
      payload: { columnId: 'col1', taskCardId: 'card1', isChecked: true },
    })
    const next = plannerReducer(checked, {
      type: 'taskCardCheckedStatusChanged',
      payload: { columnId: 'col1', taskCardId: 'card1', isChecked: false },
    })
    expect(next.taskCards.card1.status).toBe('created')
    expect(next.columns.col1.taskCards).toEqual(['card2', 'card1'])
  })

  it('changes title and content', () => {
    let next = plannerReducer(baseState(), {
      type: 'taskCardTitleChanged',
      payload: { taskCardId: 'card1', newTitle: 'Renamed' },
    })
    next = plannerReducer(next, {
      type: 'taskCardContentChanged',
      payload: { taskCardId: 'card1', newContent: 'Notes' },
    })
    expect(next.taskCards.card1.title).toBe('Renamed')
    expect(next.taskCards.card1.content).toBe('Notes')
  })

  it('deletes a card from its column and the map', () => {
    const next = plannerReducer(baseState(), {
      type: 'taskCardDeleted',
      payload: { columnId: 'col1', taskCardId: 'card1' },
    })
    expect(next.columns.col1.taskCards).toEqual(['card2'])
    expect(next.taskCards.card1).toBeUndefined()
  })

  it('adds, retitles, checks, reorders, and deletes subtasks', () => {
    let next = plannerReducer(baseState(), {
      type: 'newSubTaskAdded',
      payload: {
        taskCardId: 'card1',
        newSubTaskDetails: { id: 'sub2', title: '', checked: false },
        newSubTasksOrder: ['sub1', 'sub2'],
      },
    })
    expect(next.taskCards.card1.subTasks).toEqual(['sub1', 'sub2'])

    next = plannerReducer(next, { type: 'subTaskTitleChanged', payload: { subTaskId: 'sub2', newTitle: 'Step two' } })
    expect(next.subTasks.sub2.title).toBe('Step two')

    next = plannerReducer(next, {
      type: 'subTasksCheckedStatusChanged',
      payload: { subTaskId: 'sub2', isChecked: true },
    })
    expect(next.subTasks.sub2.checked).toBe(true)

    next = plannerReducer(next, {
      type: 'subTasksReordered',
      payload: { taskCardId: 'card1', reorderedSubTasks: ['sub2', 'sub1'] },
    })
    expect(next.taskCards.card1.subTasks).toEqual(['sub2', 'sub1'])

    next = plannerReducer(next, {
      type: 'subTaskDeletedOnBackspaceKeydown',
      payload: { taskCardId: 'card1', subTaskId: 'sub1', newSubtasks: ['sub2'] },
    })
    expect(next.taskCards.card1.subTasks).toEqual(['sub2'])
    expect(next.subTasks.sub1).toBeUndefined()
  })

  it('deleting a category reassigns its cards to unassigned', () => {
    const next = plannerReducer(baseState(), {
      type: 'categoryDeleted',
      payload: { boardId: 'board1', categoryId: 'cat1' },
    })
    expect(next.categories.cat1).toBeUndefined()
    expect(next.boards.board1.categories).toEqual([UNASSIGNED_CATEGORY_ID])
    expect(next.taskCards.card1.category).toBe(UNASSIGNED_CATEGORY_ID)
    expect(next.taskCards.card3.category).toBe(UNASSIGNED_CATEGORY_ID)
    expect(next.taskCards.card2.category).toBe(UNASSIGNED_CATEGORY_ID)
  })

  it('adds and edits categories', () => {
    let next = plannerReducer(baseState(), {
      type: 'newCategoryAdded',
      payload: { boardId: 'board1', newCategoryDetails: { id: 'cat2', name: 'Errands', color: 'green' } },
    })
    expect(next.boards.board1.categories).toContain('cat2')
    expect(next.categories.cat2.name).toBe('Errands')

    next = plannerReducer(next, {
      type: 'categoryInfoChanged',
      payload: { categoryDetails: { id: 'cat2', name: 'Chores', color: 'red' } },
    })
    expect(next.categories.cat2).toEqual({ id: 'cat2', name: 'Chores', color: 'red' })
  })

  it('changes a card category', () => {
    const next = plannerReducer(baseState(), {
      type: 'taskCategoryChanged',
      payload: { taskCardId: 'card2', newCategoryId: 'cat1' },
    })
    expect(next.taskCards.card2.category).toBe('cat1')
  })

  it('does not mutate the previous state (immer)', () => {
    const before = baseState()
    const frozen = JSON.parse(JSON.stringify(before))
    plannerReducer(before, { type: 'boardDeleted', payload: { boardId: 'board1' } })
    expect(before).toEqual(frozen)
  })
})
