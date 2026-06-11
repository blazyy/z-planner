import { TaskCardInfoType } from '@/hooks/Planner/types'
import axios from 'axios'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'
import { sendMutation } from '../apiClient'

export default function deleteSubTask(taskCard: TaskCardInfoType, subTaskId: string, dispatch: PlannerDispatchContextType) {
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
  sendMutation(dispatch, () => axios.delete(`/api/planner/cards/${taskCard.id}/subtasks/${subTaskId}`))
}
