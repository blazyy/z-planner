import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const changeBoardInfo = async (
  boardId: string,
  newName: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  dispatch({
    type: 'boardNameChanged',
    payload: {
      boardId,
      newName,
    },
  })
  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}`, {
      newName,
    })
    .catch((error) => showErrorBoundary(error))
}
