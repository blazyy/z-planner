import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function deleteColumn(
  boardId: string,
  columnId: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'columnDeleted',
    payload: {
      boardId,
      columnId,
    },
  })
  axios
    .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/columns/${columnId}/delete`)
    .catch((error) => showErrorBoundary(error))
}
