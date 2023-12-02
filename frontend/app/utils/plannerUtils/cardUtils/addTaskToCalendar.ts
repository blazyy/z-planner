import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export default async function addTaskToCalendar(
  draggedCardId: string,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) {
  dispatch({
    type: 'cardScheduledOnCalendar',
    payload: {
      taskCardId: draggedCardId,
    },
  })

  //   axios
  //     .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/move`, {
  //       sourceColumnId,
  //       destColumnId,
  //       sourceColumnTaskCardIds,
  //       destColumnTaskCardIds,
  //     })
  //     .catch((error) => showErrorBoundary(error))
}
