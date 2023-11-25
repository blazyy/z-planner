import { ErrorBoundaryType } from '@/app/utils/plannerUtils/types'
import { PlannerDispatchContextType, SubTaskInfoType, SubTasksType, TaskCardsType } from '@/hooks/Planner/types'

export type HandleKeyDownOnSubTaskFunc = (
  event: React.KeyboardEvent<HTMLInputElement>,
  taskCards: TaskCardsType,
  subTasks: SubTasksType,
  plannerDispatch: PlannerDispatchContextType,
  taskCardId: string,
  subTask: SubTaskInfoType,
  showBoundary: ErrorBoundaryType
) => void

export type HandleArrowDownFunc = (taskCards: TaskCardsType, taskCardId: string, subTask: SubTaskInfoType) => void

export type HandleArrowUpFunc = (taskCards: TaskCardsType, taskCardId: string, subTask: SubTaskInfoType) => void

export type HandleBackspaceFunc = (
  event: React.KeyboardEvent<HTMLInputElement>,
  plannerDispatch: PlannerDispatchContextType,
  taskCardId: string,
  subTask: SubTaskInfoType
) => void

export type HandleEnterFunc = (
  taskCards: TaskCardsType,
  subTasks: SubTasksType,
  plannerDispatch: PlannerDispatchContextType,
  taskCardId: string,
  subTask: SubTaskInfoType,
  showBoundary: ErrorBoundaryType
) => void
