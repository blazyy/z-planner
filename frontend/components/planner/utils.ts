'use client'
import addTaskToCalendar from '@/app/utils/plannerUtils/cardUtils/addTaskToCalendar'
import moveCardAcrossColumns from '@/app/utils/plannerUtils/cardUtils/moveCardAcrossColumns'
import moveCardWithinColumn from '@/app/utils/plannerUtils/cardUtils/moveCardWithinColumn'
import { changeColumnOrder } from '@/app/utils/plannerUtils/columnUtils/changeColumnOrder'
import { reorderSubTasks } from '@/app/utils/plannerUtils/subTaskUtils/reorderSubtasks'
import { ErrorBoundaryType } from '@/app/utils/plannerUtils/types'
import { PlannerDispatchContextType, PlannerType } from '@/hooks/Planner/types'
import type { DragStart, DropResult } from '@hello-pangea/dnd'

type OnDragEndFunc = (
  result: DropResult,
  dispatch: PlannerDispatchContextType,
  plannerContext: PlannerType,
  showErrorBoundary: ErrorBoundaryType,
  boardId: string
) => void

export const handleOnDragEnd: OnDragEndFunc = (result, dispatch, plannerContext, showErrorBoundary, boardId) => {
  const { destination, source, draggableId, type } = result
  const { boards, columns, taskCards } = plannerContext

  // If there's no destination or if card is in original position from where it was dragged from, do nothing
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
    return
  }

  if (type === 'subtask')
    return reorderSubTasks(taskCards, draggableId, source.index, destination.index, dispatch, showErrorBoundary)

  if (type === 'column')
    return changeColumnOrder(boards, boardId, draggableId, source.index, destination.index, dispatch, showErrorBoundary)

  dispatch({
    type: 'idOfCardBeingDraggedChanged',
    payload: '',
  })

  if (destination.droppableId === 'calendar') {
    addTaskToCalendar(draggableId, dispatch, showErrorBoundary)
    return
  }

  // Moving a card within the same column
  if (columns[source.droppableId] === columns[destination.droppableId])
    return moveCardWithinColumn(
      columns,
      source.droppableId,
      draggableId,
      source.index,
      destination.index,
      dispatch,
      showErrorBoundary
    )

  // Moving cards between columns
  moveCardAcrossColumns(columns, draggableId, source, destination, dispatch, showErrorBoundary)
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
