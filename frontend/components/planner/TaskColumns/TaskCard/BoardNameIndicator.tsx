import { usePlanner } from '@/hooks/Planner/Planner'

type BoardNameIndicatorProps = {
  boardId: string
}

export const BoardNameIndicator = ({ boardId }: BoardNameIndicatorProps) => {
  const { boards } = usePlanner()
  const board = boards[boardId]
  return <span className='text-sm text-indigo-600'># {board.name}</span>
}
