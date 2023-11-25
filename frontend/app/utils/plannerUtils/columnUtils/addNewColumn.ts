import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

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
