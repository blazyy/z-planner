import { ErrorBoundaryType } from '@/app/utils/plannerUtils/types'
import {
  PlannerDispatchContextType,
  SubTaskInfoType,
  SubTasksType,
  TaskCardInfoType,
  TaskCardsType,
} from '@/hooks/Planner/types'

export type HandleKeyDownOnSubTaskFunc = (
  taskCards: TaskCardsType,
  subTasks: SubTasksType,
  taskCardId: string,
  subTask: SubTaskInfoType,
  event: React.KeyboardEvent<HTMLInputElement>,
  dispatch: PlannerDispatchContextType,
  showBoundary: ErrorBoundaryType
) => void

export type HandleArrowDownFunc = (taskCards: TaskCardsType, taskCardId: string, subTask: SubTaskInfoType) => void

export type HandleArrowUpFunc = (taskCards: TaskCardsType, taskCardId: string, subTask: SubTaskInfoType) => void

export type HandleBackspaceFunc = (
  taskCard: TaskCardInfoType,
  subTaskId: string,
  event: React.KeyboardEvent<HTMLInputElement>,
  dispatch: PlannerDispatchContextType,
  showBoundary: ErrorBoundaryType
) => void

export type HandleEnterFunc = (
  taskCards: TaskCardsType,
  taskCardId: string,
  subTask: SubTaskInfoType,
  dispatch: PlannerDispatchContextType,
  showBoundary: ErrorBoundaryType
) => void
