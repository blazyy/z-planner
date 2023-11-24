import { BoardsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from './types'

export const addNewColumn = async (
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType,
  boardId: string,
  newColumnName: string
) => {
  const newColumnId = crypto.randomUUID()
  dispatch({
    type: 'newColumnAdded',
    payload: {
      boardId,
      newColumnId,
      newColumnName,
    },
  })
  axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/columns`, {
      newColumnId,
      newColumnName,
    })
    .catch((error) => showErrorBoundary(error))
}

export const changeColumnOrder = async (
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType,
  boards: BoardsType,
  boardId: string,
  draggableId: string,
  sourceIndex: number,
  destIndex: number
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
    .put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/columns/reorder`, {
      newColumnOrder,
    })
    .catch((error) => showErrorBoundary(error))
}
