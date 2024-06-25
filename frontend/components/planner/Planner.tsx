'use client'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
// import { ProtectedRoute } from '../global/ProtectedRoute'
import { PlannerFiltersProvider } from '@/hooks/PlannerFilters/PlannerFilters'
import { DragDropContext } from '@hello-pangea/dnd'
import { useErrorBoundary } from 'react-error-boundary'
import { LoadingSpinner } from '../global/LoadingSpinner/LoadingSpinner'
import { AddBoardCallout } from './AddBoardCallout'
import { Board } from './Board/Board'
import { ManagingView } from './Board/ManagingView/ManagingView'
import { RightSideBar } from './RightSideBar/RightSideBar'
import { Sidebar } from './Sidebar/Sidebar'
import { handleOnDragEnd, handleOnDragStart } from './utils'

export const Planner = () => {
  const plannerContext = usePlanner()
  const plannerDispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  const { currentView } = usePlanner()
  return (
    <main id='planner' className='flex flex-col justify-start items-center w-full min-h-screen'>
      {!plannerContext.hasLoaded && <LoadingSpinner />}
      {plannerContext.hasLoaded && plannerContext.boardOrder.length === 0 && <AddBoardCallout />}
      {plannerContext.hasLoaded && plannerContext.boardOrder.length > 0 && (
        <DragDropContext
          onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, plannerDispatch)}
          onDragEnd={(result) =>
            handleOnDragEnd(result, plannerDispatch, plannerContext, showBoundary, plannerContext.selectedBoard)
          }
        >
          <div className='flex justify-between gap-4 mt-16 w-full h-full'>
            <PlannerFiltersProvider>
              <Sidebar />
              {currentView === 'board' ? <Board boardId={plannerContext.selectedBoard} /> : <ManagingView />}
            </PlannerFiltersProvider>
          </div>
        </DragDropContext>
      )}
      <RightSideBar />
    </main>
  )
}
