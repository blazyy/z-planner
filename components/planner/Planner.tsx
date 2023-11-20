import { usePlanner } from '@/hooks/Planner/Planner'
import { LoadingSpinner } from '../global/LoadingSpinner'
import { ProtectedRoute } from '../global/ProtectedRoute'
import { AddBoardCallout } from './AddBoardCallout'
import { Board } from './Board/Board'

export const Planner = () => {
  const data = usePlanner()

  if (!data.hasLoaded) return <LoadingSpinner />
  return (
    <ProtectedRoute>
      <main className='flex min-h-screen flex-col justify-center items-center gap-8'>
        {data.boardOrder.length === 0 ? <AddBoardCallout /> : <Board />}
      </main>
    </ProtectedRoute>
  )
}
