import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export default function deleteCategory(boardId: string, categoryId: string, dispatch: Dispatch<any>) {
  dispatch({
    type: 'categoryDeleted',
    payload: {
      boardId,
      categoryId,
    },
  })
  sendMutation(dispatch, () => axios.delete(`/api/planner/boards/${boardId}/categories/${categoryId}`))
}
