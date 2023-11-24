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
