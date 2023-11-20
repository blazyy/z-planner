import { supabaseClient } from '@/config/supabase-client'
import { SupabaseClient } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'
import { BoardsType, ColumnsType, SubTasksType, TaskCardsType, TaskCategoryType } from '../Planner/types'

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
    const { data: boardOrderRespone, error: boardOrderError } = await supabaseClient.from('planner').select().limit(1)

    const { data: boardsResponse, error: boardsError } = await supabaseClient.from('boards').select()
    const boards: BoardsType = {}
    for (let board of boardsResponse!) {
      const { id: boardId, name, columns } = board
      boards[boardId] = {
        id: boardId,
        name,
        columns,
      }
    }

    const { data: columnsResponse, error: columnsError } = await supabaseClient.from('columns').select()
    const columns: ColumnsType = {}
    for (let column of columnsResponse!) {
      const { id: columnId, name, taskCards } = column
      columns[columnId] = {
        id: columnId,
        name,
        taskCards,
      }
    }

    const { data: taskCardsReponse, error: taskCardsError } = await supabaseClient.from('taskCards').select()
    const taskCards: TaskCardsType = {}
    for (let taskCard of taskCardsReponse!) {
      const { id: taskCardId, title, category, content, checked, subTasks } = taskCard
      taskCards[taskCardId] = {
        id: taskCardId,
        title,
        category,
        content,
        checked,
        subTasks,
      }
    }

    const { data: categoriesResponse, error: categoriesError } = await supabaseClient.from('categories').select()
    console.log(categoriesResponse)
    const categories: TaskCategoryType = {}
    for (let category of categoriesResponse!) {
      const { name, color } = category
      categories[name] = {
        color,
      }
    }

    const { data: subTasksResponse, error: subTasksError } = await supabaseClient.from('subTasks').select()
    console.log(subTasksResponse)
    const subTasks: SubTasksType = {}
    for (let subTask of subTasksResponse!) {
      const { id: subTaskId, title, checked } = subTask
      subTasks[subTaskId] = {
        id: subTaskId,
        title,
        checked,
      }
    }

    const initialPlannerData = {
      boardOrder: boardOrderRespone![0].value,
      boards,
      columns,
      categories,
      taskCards,
      subTasks,
    }
    return initialPlannerData
  },
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
