'use client'
import { moveCardAcrossColumns, moveCardWithinColumn } from '@/app/utils/plannerUtils/cardUtils'
import { changeColumnOrder } from '@/app/utils/plannerUtils/columnUtils'
import { reorderSubTasks } from '@/app/utils/plannerUtils/subTaskUtils'
import { PlannerDispatchContextType, PlannerType } from '@/hooks/Planner/types'
import type { DragStart, DropResult } from '@hello-pangea/dnd'

type OnDragEndFunc = (
  result: DropResult,
  dispatch: PlannerDispatchContextType,
  plannerContext: PlannerType,
  boardId: string
) => void

export const handleOnDragEnd: OnDragEndFunc = (result, dispatch, plannerContext, boardId) => {
  const { destination, source, draggableId, type } = result
  const { showErrorBoundary, boards, columns, taskCards } = plannerContext

  // If there's no destination or if card is in original position from where it was dragged from, do nothing
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
    return
  }

  if (type === 'subtask')
    return reorderSubTasks(dispatch, showErrorBoundary, taskCards, draggableId, source.index, destination.index)

  if (type === 'column')
    return changeColumnOrder(dispatch, showErrorBoundary, boards, boardId, draggableId, source.index, destination.index)

  dispatch({
    type: 'idOfCardBeingDraggedChanged',
    payload: '',
  })

  // Moving a card within the same column
  if (columns[source.droppableId] === columns[destination.droppableId])
    return moveCardWithinColumn(dispatch, showErrorBoundary, columns, draggableId, source, destination)

  // Moving cards between columns
  moveCardAcrossColumns(dispatch, showErrorBoundary, columns, draggableId, source, destination)
}

type OnDragStartFunction = (dragStartObj: DragStart, dispatch: PlannerDispatchContextType) => void

export const handleOnDragStart: OnDragStartFunction = (dragStartObj, dispatch) => {
  if (dragStartObj.type === 'subtask') {
    dispatch({
      type: 'subTaskDragStatusChanged',
      payload: true,
    })
  }
  if (dragStartObj.type === 'card') {
    dispatch({
      type: 'idOfCardBeingDraggedChanged',
      payload: dragStartObj.draggableId,
    })
  }
}
