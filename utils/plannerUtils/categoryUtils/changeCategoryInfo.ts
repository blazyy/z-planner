import axios from 'axios'
import { Dispatch } from 'react'
import { sendMutation } from '../apiClient'

export const changeCategoryInfo = (categoryId: string, newName: string, newColor: string, dispatch: Dispatch<any>) => {
  const categoryDetails = {
    id: categoryId,
    name: newName,
    color: newColor,
  }
  dispatch({
    type: 'categoryInfoChanged',
    payload: {
      categoryDetails,
    },
  })
  sendMutation(dispatch, () => axios.patch(`/api/planner/categories/${categoryId}`, { newName, newColor }))
}
