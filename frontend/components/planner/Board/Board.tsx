import { usePlanner } from '@/hooks/Planner/Planner'
import { PlannerFiltersProvider } from '@/hooks/PlannerFilters/PlannerFilters'
import { FilterToolbar } from './FilterToolbar/FilterToolbar'
import { TaskColumns } from './TaskColumns/TaskColumns'

export const Board = () => {
  const { selectedBoard } = usePlanner()

  return (
    <div className='flex flex-col ml-2 mb-24 gap-2'>
      <PlannerFiltersProvider>
        <FilterToolbar />
        <TaskColumns boardId={selectedBoard} />
      </PlannerFiltersProvider>
    </div>
  )
}
