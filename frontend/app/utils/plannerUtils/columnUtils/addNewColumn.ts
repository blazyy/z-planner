import { BoardInfoType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const addNewColumn = async (
  board: BoardInfoType,
  newColumnName: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const newColumnId = crypto.randomUUID()
  const newColumnDetails = {
    id: newColumnId,
    name: newColumnName,
    taskCards: [],
  }
  const updatedColumns = Array.from(board.columns)
  updatedColumns.push(newColumnDetails.id) // Add to beginning of array
  dispatch({
    type: 'newColumnAdded',
    payload: {
      boardId: board.id,
      newColumnDetails,
      updatedColumns,
    },
  })
  axios
    .post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${board.id}/columns`, {
      newColumnDetails,
      updatedColumns,
    })
    .catch((error) => showErrorBoundary(error))
}
