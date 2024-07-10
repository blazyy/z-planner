import { TaskCardsType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'

export const reorderSubTasks = async (
  taskCards: TaskCardsType,
  draggableId: string,
  sourceIndex: any,
  destIndex: any,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
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
  const token = await getToken()
  axios
    .patch(
      `/api/planner/cards/${taskCardId}/subtasks/move`,
      {
        reorderedSubTasks,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .catch((error) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    })
}
