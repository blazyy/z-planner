'use client'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
// import { ProtectedRoute } from '../global/ProtectedRoute'
import { PlannerFiltersProvider } from '@/hooks/PlannerFilters/PlannerFilters'
import { useAuth } from '@clerk/nextjs'
import { DragDropContext } from '@hello-pangea/dnd'
import { BackendErrorAlertCard } from '../global/AlertCard/AlertCard'
import { MultiStepLoader } from '../ui/multi-step-loader'
import { AddBoardCallout } from './AddBoardCallout'
import { ArchiveView } from './ArchiveView/ArchiveView'
import { Board } from './Board/Board'
import { SettingsView } from './SettingsView/SettingsView'
import { Sidebar } from './Sidebar/Sidebar'
import { handleOnDragEnd, handleOnDragStart } from './utils'

export const Planner = () => {
  const plannerContext = usePlanner()
  const plannerDispatch = usePlannerDispatch()
  const { getToken } = useAuth()

  if (plannerContext.backendErrorOccurred) {
    return <BackendErrorAlertCard />
  }

  if (!plannerContext.hasLoaded) {
    return <MultiStepLoader loading={!plannerContext.hasLoaded} />
  }

  if (plannerContext.boardOrder.length === 0) {
    return <AddBoardCallout />
  }

  return (
    <main id='planner' className='flex flex-col flex-1 justify-start items-center p-5 w-full'>
      {plannerContext.boardOrder.length > 0 && (
        <DragDropContext
          onDragStart={(dragStartObj) => handleOnDragStart(dragStartObj, plannerDispatch)}
          onDragEnd={(result) =>
            handleOnDragEnd(result, plannerDispatch, getToken, plannerContext, plannerContext.selectedBoard)
          }
        >
          <div className='flex flex-1 justify-start gap-2 w-full'>
            <PlannerFiltersProvider>
              <Sidebar />
              {plannerContext.currentView === 'board' ? (
                <Board boardId={plannerContext.selectedBoard} />
              ) : plannerContext.currentView === 'archive' ? (
                <ArchiveView />
              ) : plannerContext.currentView === 'settings' ? (
                <SettingsView />
              ) : (
                <></>
              )}
            </PlannerFiltersProvider>
          </div>
        </DragDropContext>
      )}
    </main>
  )
}
