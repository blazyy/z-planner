import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function deleteBoard(
  boardId: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'boardDeleted',
    payload: {
      boardId,
    },
  })

  axios
    .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}`)
    .catch((error) => showErrorBoundary(error))
}
