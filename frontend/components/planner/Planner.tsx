import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { LoadingSpinner } from '../global/LoadingSpinner/LoadingSpinner'
// import { ProtectedRoute } from '../global/ProtectedRoute'
import { DragDropContext } from '@hello-pangea/dnd'
import { useErrorBoundary } from 'react-error-boundary'
import { AddBoardCallout } from './AddBoardCallout'
import { Board } from './Board/Board'
import { CalendarColumn } from './CalendarColumn/CalendarColumn'
import { Sidebar } from './Sidebar/Sidebar'
import { handleOnDragEnd, handleOnDragStart } from './utils'

export const Planner = () => {
  const plannerContext = usePlanner()
  const plannerDispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  return (
    <main className='flex min-h-screen flex-col justify-center items-center gap-8'>
      {!plannerContext.hasLoaded && <LoadingSpinner />}
      {plannerContext.hasLoaded && plannerContext.boardOrder.length === 0 && <AddBoardCallout />}
      {plannerContext.hasLoaded && plannerContext.boardOrder.length > 0 && (
        <DragDropContext
          onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, plannerDispatch)}
          onDragEnd={(result) =>
            handleOnDragEnd(result, plannerDispatch, plannerContext, showBoundary, plannerContext.selectedBoard)
          }
        >
          <div className='flex gap-12'>
            <Sidebar />
            <Board boardId={plannerContext.selectedBoard} />
            <CalendarColumn />
          </div>
        </DragDropContext>
      )}
    </main>
  )
}
