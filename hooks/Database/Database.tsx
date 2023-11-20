import { supabaseClient } from '@/config/supabase-client'
import { SupabaseClient } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

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
  getInitialPlannerData: async () => {
    const { data, error } = await supabaseClient.from('planner').select()
    return data
  },
  addFirstBoard: async (boardId: string, boardName: string) => {
    var { error } = await supabaseClient.from('planner').insert([{ key: 'board_order', value: [boardId] }])
  },
  // addNewBoard: async (boardId: string, boardName: string) => {
  //   // const { data, error } = await supabaseClient.from('planner').select()
  //   // console.log(data)

  //   var { data, error } = await supabaseClient.from('planner').select()

  //   // TODO CHECK FOR CONFLICTING IDS
  //   const existingBoardIds = data
  //   existingBoardIds?.push(boardId)

  //   var { error } = await supabaseClient.from('planner').insert([{ key: 'board_order', value: existingBoardIds }])
  //   // const { data1, error1 } = await supabaseClient.from('boards').insert([{ key: 'board_order', value: [boardId] }])

  //   console.log('data', data)
  //   console.log('erro', error)
  // },
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
