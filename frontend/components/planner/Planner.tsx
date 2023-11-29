import { usePlanner } from '@/hooks/Planner/Planner'
import { LoadingSpinner } from '../global/LoadingSpinner/LoadingSpinner'
// import { ProtectedRoute } from '../global/ProtectedRoute'
import { AddBoardCallout } from './AddBoardCallout'
import { Board } from './Board/Board'
import { Sidebar } from './Sidebar/Sidebar'

export const Planner = () => {
  const { hasLoaded, boardOrder } = usePlanner()
  return (
    <main className='flex min-h-screen flex-col justify-center items-center gap-8'>
      {!hasLoaded && <LoadingSpinner />}
      {hasLoaded && boardOrder.length === 0 && <AddBoardCallout />}
      {hasLoaded && boardOrder.length > 0 && (
        <div className='flex gap-12'>
          <Sidebar />
          <Board />
        </div>
      )}
    </main>
  )
}
