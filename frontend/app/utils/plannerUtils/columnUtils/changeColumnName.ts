import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function changeColumnName(
  columnId: string,
  newName: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'columnNameChanged',
    payload: {
      columnId,
      newName,
    },
  })

  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}`, {
      newName,
    })
    .catch((error) => showErrorBoundary(error))
}
