'use client'
import { PlannerDispatchContextType, PlannerType } from '@/hooks/Planner/types'
import moveCardAcrossColumns from '@/utils/plannerUtils/cardUtils/moveCardAcrossColumns'
import moveCardWithinColumn from '@/utils/plannerUtils/cardUtils/moveCardWithinColumn'
import { changeColumnOrder } from '@/utils/plannerUtils/columnUtils/changeColumnOrder'
import { reorderSubTasks } from '@/utils/plannerUtils/subTaskUtils/reorderSubtasks'
import type { DragStart, DropResult } from '@hello-pangea/dnd'

type OnDragEndFunc = (
  result: DropResult,
  dispatch: PlannerDispatchContextType,
  plannerContext: PlannerType,
  boardId: string
) => void

export const handleOnDragEnd: OnDragEndFunc = (result, dispatch, plannerContext, boardId) => {
  const { destination, source, draggableId, type } = result
  const { boards, columns, taskCards } = plannerContext

  // Needed to fix bug where subtask drag handle would behave weirdly after being dropped in
  // position where it was originally dragged from
  if (type === 'subtask') {
    dispatch({
      type: 'subTaskDragStatusChanged',
      payload: false,
    })
  }
  // If there's no destination or if card is in original position from where it was dragged from, do nothing
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
    return
  }

  if (type === 'subtask') {
    return reorderSubTasks(taskCards, draggableId, source.index, destination.index, dispatch)
  }

  if (type === 'column') {
    return changeColumnOrder(boards, boardId, draggableId, source.index, destination.index, dispatch)
  }

  // Moving a card within the same column
  if (columns[source.droppableId] === columns[destination.droppableId]) {
    return moveCardWithinColumn(columns, source.droppableId, draggableId, source.index, destination.index, dispatch)
  }

  // Moving cards between columns
  moveCardAcrossColumns(columns, draggableId, source, destination, dispatch)
}

type OnDragStartFunction = (dragStartObj: DragStart, dispatch: PlannerDispatchContextType) => void

export const handleOnDragStart: OnDragStartFunction = (dragStartObj, dispatch) => {
  if (dragStartObj.type === 'subtask') {
    dispatch({
      type: 'subTaskDragStatusChanged',
      payload: true,
    })
  }
}
