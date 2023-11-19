import { PlannerData, PlannerDispatchContextType, SubTaskInfoType } from '@/hooks/Planner/types'

export type HandleKeyDownOnSubTaskFunc = (
  event: React.KeyboardEvent<HTMLInputElement>,
  data: PlannerData,
  plannerDispatch: PlannerDispatchContextType,
  taskCardId: string,
  subTask: SubTaskInfoType
) => void

export type HandleArrowDownFunc = (data: PlannerData, taskCardId: string, subTask: SubTaskInfoType) => void

export type HandleArrowUpFunc = (data: PlannerData, taskCardId: string, subTask: SubTaskInfoType) => void

export type HandleBackspaceFunc = (
  event: React.KeyboardEvent<HTMLInputElement>,
  plannerDispatch: PlannerDispatchContextType,
  taskCardId: string,
  subTask: SubTaskInfoType
) => void

export type HandleEnterFunc = (
  data: PlannerData,
  plannerDispatch: PlannerDispatchContextType,
  taskCardId: string,
  subTask: SubTaskInfoType
) => void
