import { ColumnsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from './types'

export const moveCardWithinColumn = async (
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType,
  columns: ColumnsType,
  draggedCardId: string,
  source: any,
  destination: any
) => {
  const columnId = source.droppableId
  const startingColumn = columns[columnId]
  const reorderedCardIds = Array.from(startingColumn.taskCards) // Copy of taskCards
  reorderedCardIds.splice(source.index, 1)
  reorderedCardIds.splice(destination.index, 0, draggedCardId)
  dispatch({
    type: 'cardMovedWithinColumn',
    payload: {
      columnId,
      reorderedCardIds,
    },
  })
  axios
    .put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}/cards/move`, { reorderedCardIds })
    .catch((error) => showErrorBoundary(error))
}

export const moveCardAcrossColumns = async (
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType,
  columns: ColumnsType,
  draggedCardId: string,
  source: any,
  destination: any
) => {
  const sourceColumnId = source.droppableId
  const sourceColumn = columns[sourceColumnId]
  const sourceColumnTaskCardIds = Array.from(sourceColumn.taskCards) // Copy of taskCards
  sourceColumnTaskCardIds.splice(source.index, 1)

  const destColumnId = destination.droppableId
  const destColumn = columns[destColumnId]
  const destColumnTaskCardIds = Array.from(destColumn.taskCards)
  destColumnTaskCardIds.splice(destination.index, 0, draggedCardId)

  dispatch({
    type: 'cardMovedAcrossColumns',
    payload: {
      sourceColumnId,
      destColumnId,
      sourceColumnTaskCardIds,
      destColumnTaskCardIds,
    },
  })

  axios
    .put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/move`, {
      sourceColumnId,
      destColumnId,
      sourceColumnTaskCardIds,
      destColumnTaskCardIds,
    })
    .catch((error) => showErrorBoundary(error))
}
