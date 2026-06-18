import axios from 'axios'

import { TaskCardsType } from '@/hooks/Planner/types'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'

import { sendMutation } from '../apiClient'

export const reorderSubTasks = (
  taskCards: TaskCardsType,
  draggableId: string,
  sourceIndex: number,
  destIndex: number,
  dispatch: PlannerDispatchContextType,
  boardId: string
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
  sendMutation(
    dispatch,
    () => axios.patch(`/api/planner/cards/${taskCardId}/subtasks/move`, { reorderedSubTasks }),
    boardId
  )
}
