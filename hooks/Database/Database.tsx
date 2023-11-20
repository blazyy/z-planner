import { supabaseClient } from '@/config/supabase-client'
import { SupabaseClient } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'
import { getInitialPlannerData } from './getInitialPlannerData'

// const databaseReducer = produce((draft, action) => {
//   switch (action.type) {
//   }
// })

type DatabaseContextType = {
  client: SupabaseClient
  getInitialPlannerData: () => any // TODO: Change from any
  addFirstBoard: (boardId: string, boardName: string) => any // TODO: Change from any
}

const databaseContext = {
  client: supabaseClient,
  getInitialPlannerData,
  addFirstBoard: async (boardId: string, boardName: string) => {
    var { error } = await supabaseClient.from('planner').insert([{ key: 'board_order', value: [boardId] }])
  },
}

export const DatabaseContext = createContext<DatabaseContextType>(databaseContext)
// export const PlannerDispatchContext = createContext<Dispatch<DatabaseContextType>>(() => {})

export const DatabaseProvider = ({ children }: { children: JSX.Element }) => {
  // const [tasks, dispatch] = useReducer(databaseReducer, initialState)

  return <DatabaseContext.Provider value={databaseContext}></DatabaseContext.Provider>
}

export const useDatabase = () => {
  return useContext(DatabaseContext)
}

// export const useDatabaseDispatch = () => {
//   return useContext(PlannerDispatchContext)
// }
