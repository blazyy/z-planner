import { supabaseClient } from '@/config/supabase-client'
import { BoardsType, ColumnsType, SubTasksType, TaskCardsType, TaskCategoryType } from '../Planner/types'

export const getInitialPlannerData = async () => {
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
  const categories: TaskCategoryType = {}
  for (let category of categoriesResponse!) {
    const { name, color } = category
    categories[name] = {
      color,
    }
  }

  const { data: subTasksResponse, error: subTasksError } = await supabaseClient.from('subTasks').select()
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
}
