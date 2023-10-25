import { configureStore } from '@reduxjs/toolkit'

import databaseReducer from './databaseSlice'
import plannerReducer from './plannerSlice'

export const store = configureStore({
  reducer: {
    planner: plannerReducer,
    database: databaseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
