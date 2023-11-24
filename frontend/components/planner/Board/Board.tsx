import { usePlanner } from '@/hooks/Planner/Planner'
import { TaskColumns } from '../TaskColumns/TaskColumns'

export const Board = () => {
  const { boardOrder } = usePlanner()
  return <TaskColumns boardId={boardOrder[0]} />
}
