import { usePlanner } from '@/hooks/Planner/Planner'
import { useState } from 'react'
import { TaskColumns } from '../TaskColumns/TaskColumns'

export const Board = () => {
  const { boardOrder } = usePlanner()!
  const [boardId, setBoardId] = useState(boardOrder[0])
  return <TaskColumns boardId={boardId} />
}
