import type { DropResult } from '@hello-pangea/dnd'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PlannerType } from '@/hooks/Planner/types'

vi.mock('@/utils/plannerUtils/cardUtils/moveCardAcrossColumns', () => ({ default: vi.fn() }))
vi.mock('@/utils/plannerUtils/cardUtils/moveCardWithinColumn', () => ({ default: vi.fn() }))
vi.mock('@/utils/plannerUtils/columnUtils/changeColumnOrder', () => ({ changeColumnOrder: vi.fn() }))
vi.mock('@/utils/plannerUtils/subTaskUtils/reorderSubtasks', () => ({ reorderSubTasks: vi.fn() }))

import moveCardAcrossColumns from '@/utils/plannerUtils/cardUtils/moveCardAcrossColumns'
import moveCardWithinColumn from '@/utils/plannerUtils/cardUtils/moveCardWithinColumn'
import { changeColumnOrder } from '@/utils/plannerUtils/columnUtils/changeColumnOrder'
import { reorderSubTasks } from '@/utils/plannerUtils/subTaskUtils/reorderSubtasks'

import { handleOnDragEnd, handleOnDragStart } from './utils'

const planner = {
  boards: { board1: { id: 'board1', name: 'Work', columns: ['col1', 'col2'], categories: [] } },
  columns: {
    col1: { id: 'col1', name: 'To Do', taskCards: ['card1', 'card2'] },
    col2: { id: 'col2', name: 'Done', taskCards: [] },
  },
  taskCards: {
    card1: { id: 'card1', title: '', category: 'unassigned', content: '', status: 'created', subTasks: [] },
  },
} as unknown as PlannerType

const drop = (overrides: Partial<DropResult>): DropResult =>
  ({
    draggableId: 'card1',
    type: 'card',
    source: { droppableId: 'col1', index: 0 },
    destination: { droppableId: 'col1', index: 1 },
    reason: 'DROP',
    mode: 'FLUID',
    combine: null,
    ...overrides,
  }) as DropResult

describe('handleOnDragEnd', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing without a destination', () => {
    handleOnDragEnd(drop({ destination: null }), vi.fn(), planner, 'board1')
    expect(moveCardWithinColumn).not.toHaveBeenCalled()
    expect(moveCardAcrossColumns).not.toHaveBeenCalled()
  })

  it('does nothing when dropped in the original position', () => {
    handleOnDragEnd(drop({ destination: { droppableId: 'col1', index: 0 } }), vi.fn(), planner, 'board1')
    expect(moveCardWithinColumn).not.toHaveBeenCalled()
  })

  it('routes same-column card drops to moveCardWithinColumn', () => {
    const dispatch = vi.fn()
    handleOnDragEnd(drop({}), dispatch, planner, 'board1')
    expect(moveCardWithinColumn).toHaveBeenCalledWith(planner.columns, 'col1', 'card1', 0, 1, dispatch)
    expect(moveCardAcrossColumns).not.toHaveBeenCalled()
  })

  it('routes cross-column card drops to moveCardAcrossColumns', () => {
    const dispatch = vi.fn()
    const result = drop({ destination: { droppableId: 'col2', index: 0 } })
    handleOnDragEnd(result, dispatch, planner, 'board1')
    expect(moveCardAcrossColumns).toHaveBeenCalledWith(
      planner.columns,
      'card1',
      result.source,
      result.destination,
      dispatch
    )
  })

  it('routes column drops to changeColumnOrder', () => {
    const dispatch = vi.fn()
    handleOnDragEnd(
      drop({ type: 'column', draggableId: 'col1', destination: { droppableId: 'board', index: 1 } }),
      dispatch,
      planner,
      'board1'
    )
    expect(changeColumnOrder).toHaveBeenCalledWith(planner.boards, 'board1', 'col1', 0, 1, dispatch)
  })

  it('routes subtask drops to reorderSubTasks and clears the drag flag', () => {
    const dispatch = vi.fn()
    handleOnDragEnd(
      drop({ type: 'subtask', draggableId: 'card1~sub1', destination: { droppableId: 'card1', index: 1 } }),
      dispatch,
      planner,
      'board1'
    )
    expect(dispatch).toHaveBeenCalledWith({ type: 'subTaskDragStatusChanged', payload: false })
    expect(reorderSubTasks).toHaveBeenCalledWith(planner.taskCards, 'card1~sub1', 0, 1, dispatch)
  })
})

describe('handleOnDragStart', () => {
  it('sets the subtask drag flag for subtask drags only', () => {
    const dispatch = vi.fn()
    handleOnDragStart({ type: 'subtask' } as Parameters<typeof handleOnDragStart>[0], dispatch)
    expect(dispatch).toHaveBeenCalledWith({ type: 'subTaskDragStatusChanged', payload: true })

    dispatch.mockClear()
    handleOnDragStart({ type: 'card' } as Parameters<typeof handleOnDragStart>[0], dispatch)
    expect(dispatch).not.toHaveBeenCalled()
  })
})
