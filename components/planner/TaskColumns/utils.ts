'use client'
import { PlannerContextType, PlannerDispatchContextType } from '@/hooks/Planner/types'
import type { DragStart, DropResult } from '@hello-pangea/dnd'

type OnDragEndFunc = (
  result: DropResult,
  plannerDispatch: PlannerDispatchContextType,
  plannerContext: PlannerContextType,
  boardId: string
) => void

export const handleOnDragEnd: OnDragEndFunc = (result, plannerDispatch, plannerContext, boardId) => {
  const { destination, source, draggableId, type } = result
  const { data } = plannerContext!

  // If there's no destination or if card is in original position from where it was dragged from, do nothing
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
    return
  }

  if (type === 'subtask') {
    plannerDispatch!({
      type: 'subTasksReordered',
      payload: {
        draggableId: draggableId,
        sourceIndex: source.index,
        destIndex: destination.index,
      },
    })
    plannerDispatch!({
      type: 'subTaskDragStatusChanged',
      payload: false,
    })
    return
  }

  if (type === 'column') {
    plannerDispatch!({
      type: 'columnsReordered',
      payload: {
        boardId,
        draggableId,
        sourceIndex: source.index,
        destIndex: destination.index,
      },
    })
    return
  }

  plannerDispatch!({
    type: 'idOfCardBeingDraggedChanged',
    payload: '',
  })

  // Moving a card within the same column
  if (data.columns[source.droppableId] === data.columns[destination.droppableId]) {
    plannerDispatch!({
      type: 'cardMovedWithinColumn',
      payload: {
        draggableId,
        source,
        destination,
      },
    })
    return
  }

  // Moving cards betweean columns
  plannerDispatch!({
    type: 'cardMovedAcrossColumns',
    payload: {
      draggableId,
      source,
      destination,
    },
  })
}

type OnDragStartFunction = (dragStartObj: DragStart, plannerDispatch: PlannerDispatchContextType) => void

export const handleOnDragStart: OnDragStartFunction = (dragStartObj, plannerDispatch) => {
  if (dragStartObj.type === 'subtask') {
    // const { setIsSubTaskBeingDragged } = plannerContext!
    plannerDispatch!({
      type: 'subTaskDragStatusChanged',
      payload: true,
    })
  }
  if (dragStartObj.type === 'card') {
    plannerDispatch!({
      type: 'idOfCardBeingDraggedChanged',
      payload: dragStartObj.draggableId,
    })
  }
}
