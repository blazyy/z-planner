import { TaskCardsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'
import { ErrorBoundaryType } from '../types'

export const reorderSubTasks = async (
  taskCards: TaskCardsType,
  draggableId: string,
  sourceIndex: any,
  destIndex: any,
  dispatch: Dispatch<any>,
  showErrorBoundary: ErrorBoundaryType
) => {
  const [taskCardId, subTaskId] = draggableId.split('~')
  const reorderedSubTasks = Array.from(taskCards[taskCardId].subTasks)
  reorderedSubTasks.splice(sourceIndex, 1)
  reorderedSubTasks.splice(destIndex, 0, subTaskId)
  dispatch({
    type: 'subTasksReordered',
    payload: {
      taskCardId,
      reorderedSubTasks,
    },
  })
  dispatch({
    type: 'subTaskDragStatusChanged',
    payload: false,
  })
  axios
    .patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/cards/${taskCardId}/subtasks/move`, {
      reorderedSubTasks,
    })
    .catch((error) => showErrorBoundary(error))
}
