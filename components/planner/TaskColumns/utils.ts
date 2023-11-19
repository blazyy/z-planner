'use client'
import { PlannerContextType, PlannerDispatchContextType } from '@/hooks/Planner/types'
import type { DragStart, DropResult } from '@hello-pangea/dnd'

type OnDragEndFunc = (
  result: DropResult,
  plannerDispatch: PlannerDispatchContextType,
  plannerContext: PlannerContextType
) => void

export const handleOnDragEnd: OnDragEndFunc = (result, plannerDispatch, plannerContext) => {
  const { destination, source, draggableId, type } = result
  const { data, setIdOfCardBeingDragged, setIsSubTaskBeingDragged } = plannerContext!

  // If there's no destination or if card is in original position from where it was dragged from, do nothing
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
    return
  }

  if (type === 'subtask') {
    plannerDispatch!({
      action: 'subTasksReordered',
      payload: {
        draggableId: draggableId,
        sourceIndex: source.index,
        destIndex: destination.index,
      },
    })
    setIsSubTaskBeingDragged(false)
    return
  }

  if (type === 'column') {
    plannerDispatch!({
      type: 'columnsReordered',
      payload: {
        draggableId: draggableId,
        sourceIndex: source.index,
        destIndex: destination.index,
      },
    })
    return
  }

  setIdOfCardBeingDragged('')

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

type OnDragStartFunction = (dragStartObj: DragStart, plannerContext: PlannerContextType) => void

export const handleOnDragStart: OnDragStartFunction = (dragStartObj, plannerContext) => {
  if (dragStartObj.type === 'subtask') {
    const { setIsSubTaskBeingDragged } = plannerContext!
    setIsSubTaskBeingDragged(true)
  }
  if (dragStartObj.type === 'card') {
    const { setIdOfCardBeingDragged } = plannerContext!
    setIdOfCardBeingDragged(dragStartObj.draggableId)
  }
}
