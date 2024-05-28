import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { LoadingSpinner } from '../global/LoadingSpinner/LoadingSpinner'
// import { ProtectedRoute } from '../global/ProtectedRoute'
import { PlannerFiltersProvider } from '@/hooks/PlannerFilters/PlannerFilters'
import { DragDropContext } from '@hello-pangea/dnd'
import { useErrorBoundary } from 'react-error-boundary'
import { AddBoardCallout } from './AddBoardCallout'
import { Board } from './Board/Board'
import { Sidebar } from './Sidebar/Sidebar'
import { handleOnDragEnd, handleOnDragStart } from './utils'

export const Planner = () => {
  const plannerContext = usePlanner()
  const plannerDispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  return (
    <main className='flex min-h-screen w-full flex-col justify-start mt-32'>
      {!plannerContext.hasLoaded && <LoadingSpinner />}
      {plannerContext.hasLoaded && plannerContext.boardOrder.length === 0 && <AddBoardCallout />}
      {plannerContext.hasLoaded && plannerContext.boardOrder.length > 0 && (
        <DragDropContext
          onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, plannerDispatch)}
          onDragEnd={(result) =>
            handleOnDragEnd(result, plannerDispatch, plannerContext, showBoundary, plannerContext.selectedBoard)
          }
        >
          <div className='flex justify-between w-full h-full gap-2'>
            <PlannerFiltersProvider>
              <Sidebar />
              <Board boardId={plannerContext.selectedBoard} />
            </PlannerFiltersProvider>
          </div>
        </DragDropContext>
      )}
    </main>
  )
}
