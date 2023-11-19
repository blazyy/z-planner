import { usePlanner } from '@/hooks/Planner/Planner'
import { useState } from 'react'
import { TaskColumns } from '../TaskColumns/TaskColumns'

export const Board = () => {
  const { data } = usePlanner()!
  const [boardId, setBoardId] = useState(data.boardOrder[0])
  return <TaskColumns boardId={boardId} />
}
