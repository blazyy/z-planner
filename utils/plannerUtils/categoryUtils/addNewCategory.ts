import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export const addNewCategory = (
  boardId: string,
  newCategoryDetails: {
    id: string
    name: string
    color: string
  },
  dispatch: Dispatch<any>
) => {
  dispatch({
    type: 'newCategoryAdded',
    payload: {
      boardId,
      newCategoryDetails,
    },
  })
  sendMutation(dispatch, () => axios.post(`/api/planner/boards/${boardId}/categories`, { newCategoryDetails }))
}
