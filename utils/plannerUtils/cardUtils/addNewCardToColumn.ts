import { ColumnInfoType, TaskCardInfoType } from '@/hooks/Planner/types'
import axios from 'axios'
import { PlannerDispatchContextType } from '@/hooks/Planner/types'
import { sendMutation } from '../apiClient'

export const addNewCardToColumn = (
  column: ColumnInfoType,
  cardDetails: {
    id: string
    title: string
    category: string
    content: string
  },
  dispatch: PlannerDispatchContextType
) => {
  const newTaskCardDetails: TaskCardInfoType = {
    id: cardDetails.id,
    title: cardDetails.title,
    category: cardDetails.category,
    content: cardDetails.content,
    status: 'created',
    subTasks: [],
  }
  const updatedTaskCards = Array.from(column.taskCards)
  updatedTaskCards.unshift(cardDetails.id) // Add to beginning of array
  dispatch({
    type: 'newTaskCardAdded',
    payload: {
      columnId: column.id,
      newTaskCardDetails,
      updatedTaskCards,
    },
  })
  sendMutation(dispatch, () =>
    axios.post(`/api/planner/columns/${column.id}/cards`, {
      newTaskCardDetails,
      updatedTaskCards,
    })
  )
}
