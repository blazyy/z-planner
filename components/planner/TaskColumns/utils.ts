'use client'

import { AppDispatch } from '@/app/store/store'
import { useAppSelector } from '@/app/store/hooks'

import type { DragStart, DropResult } from '@hello-pangea/dnd'
import {
  cardMovedAcrossColumns,
  cardMovedWithinColumn,
  columnsReordered,
  idOfCardBeingMovedChanged,
  subTaskDragged,
  subTasksReordered,
} from '@/app/store/planner/reducer'
import { PlannerDataType } from '@/components/planner/TaskColumns/TaskColumns'

type OnDragEndFunc = (data: PlannerDataType, result: DropResult, dispatch: AppDispatch) => void

export const handleOnDragEnd: OnDragEndFunc = (data, result, dispatch) => {
  const { destination, source, draggableId, type } = result

  // If there's no destination or if card is in original position from where it was dragged from, do nothing
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
    return
  }

  if (type === 'subtask') {
    dispatch(
      subTasksReordered({
        draggableId: draggableId,
        sourceIndex: source.index,
        destIndex: destination.index,
      })
    )
    return
  }

  if (type === 'column') {
    dispatch(
      columnsReordered({
        draggableId: draggableId,
        sourceIndex: source.index,
        destIndex: destination.index,
      })
    )
    return
  }

  dispatch(idOfCardBeingMovedChanged({ id: '' }))

  // Moving a card within the same column
  if (data.columns[source.droppableId] === data.columns[destination.droppableId]) {
    dispatch(
      cardMovedWithinColumn({
        draggableId,
        source,
        destination,
      })
    )
    return
  }

  // Moving cards betweean columns
  dispatch(
    cardMovedAcrossColumns({
      draggableId,
      source,
      destination,
    })
  )
}

type OnDragStartFunction = (dragStartObj: DragStart, dispatch: AppDispatch) => void

export const handleOnDragStart: OnDragStartFunction = (dragStartObj, dispatch) => {
  if (dragStartObj.type === 'subtask') dispatch(subTaskDragged())
  if (dragStartObj.type === 'card') dispatch(idOfCardBeingMovedChanged({ id: dragStartObj.draggableId }))
}
