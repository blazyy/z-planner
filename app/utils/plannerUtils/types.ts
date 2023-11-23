import { BoardsType } from '@/hooks/Planner/types'
import { Dispatch } from 'react'

export type GetNewColumnOrderFunc = (
  dispatch: Dispatch<any>,
  boards: BoardsType,
  boardId: string,
  draggableId: string,
  sourceIndex: number,
  destIndex: number
) => Promise<any>
