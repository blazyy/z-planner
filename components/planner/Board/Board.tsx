import { LoadingSpinner } from '@/components/global/LoadingSpinner'
import { usePlanner } from '@/hooks/Planner/Planner'
import { TaskColumns } from '../TaskColumns/TaskColumns'

export const Board = () => {
  const data = usePlanner()!
  if (!data.dataLoaded) {
    return <LoadingSpinner />
  }
  return <TaskColumns boardId={data.boardOrder[0]} />
}
