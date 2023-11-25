import { ColumnsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function moveCardWithinColumn(
  columns: ColumnsType,
  columnId: string,
  cardId: string,
  sourceIndex: any,
  destIndex: any,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  const startingColumn = columns[columnId]
  const reorderedCardIds = Array.from(startingColumn.taskCards) // Copy of taskCards
  reorderedCardIds.splice(sourceIndex, 1)
  reorderedCardIds.splice(destIndex, 0, cardId)

  dispatch({
    type: 'cardMovedWithinColumn',
    payload: {
      columnId,
      reorderedCardIds,
    },
  })

  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}/cards/move`, { reorderedCardIds })
    .catch((error) => showErrorBoundary(error))
}
