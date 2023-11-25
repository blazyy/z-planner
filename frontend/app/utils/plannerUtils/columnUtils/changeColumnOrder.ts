import { BoardsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const changeColumnOrder = async (
  boards: BoardsType,
  boardId: string,
  draggableId: string,
  sourceIndex: number,
  destIndex: number,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const newColumnOrder = Array.from(boards[boardId].columns)
  newColumnOrder.splice(sourceIndex, 1)
  newColumnOrder.splice(destIndex, 0, draggableId)
  dispatch({
    type: 'columnsReordered',
    payload: {
      boardId,
      newColumnOrder,
    },
  })
  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/columns/reorder`, {
      newColumnOrder,
    })
    .catch((error) => showErrorBoundary(error))
}
