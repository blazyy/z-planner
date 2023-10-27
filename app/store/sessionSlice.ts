import initialData from '@/components/planner/TaskColumns/initial-data'
import { PlannerDataType } from '@/components/planner/types'
import { createSlice } from '@reduxjs/toolkit'

type InitialState = {
  data: PlannerDataType
}

const initialState: InitialState = {
  data: initialData,
}

export const plannerSlice = createSlice({
  name: 'session',
  initialState: initialState,
  reducers: {},
})

export const {} = plannerSlice.actions

export default plannerSlice.reducer
