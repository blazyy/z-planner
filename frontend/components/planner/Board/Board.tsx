import { usePlanner } from '@/hooks/Planner/Planner'
import { TaskColumns } from '../TaskColumns/TaskColumns'

type BoardProps = {
  boardId: string
}

export const Board = () => {
  const { selectedBoard } = usePlanner()
  return <TaskColumns boardId={selectedBoard} />
}
