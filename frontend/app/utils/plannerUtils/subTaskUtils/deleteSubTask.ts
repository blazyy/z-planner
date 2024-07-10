import { TaskCardInfoType } from '@/hooks/Planner/types'
import axios from 'axios'
import { Dispatch } from 'react'

export default async function deleteSubTask(
  taskCard: TaskCardInfoType,
  subTaskId: string,
  dispatch: Dispatch<any>,
  getToken: () => Promise<string | null>
) {
  /* Moves cursor focus to subtask above using the subtask ID */
  const subTasksCopy = Array.from(taskCard.subTasks)
  const subTaskIndex = subTasksCopy.findIndex((id: string) => id === subTaskId)
  if (subTaskIndex > 0) {
    document.getElementById(subTasksCopy[subTaskIndex - 1])?.focus()
  }
  /* -------------------------------------------------------- */
  const newSubtasks = subTasksCopy.filter((id: string) => id !== subTaskId)
  dispatch({
    type: 'subTaskDeletedOnBackspaceKeydown',
    payload: {
      taskCardId: taskCard.id,
      subTaskId,
      newSubtasks,
    },
  })
  const token = await getToken()
  axios
    .delete(`/api/planner/cards/${taskCard.id}/subtasks/${subTaskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    })
}
