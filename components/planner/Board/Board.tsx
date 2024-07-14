'use client'
import { PlannerFiltersProvider } from '@/hooks/PlannerFilters/PlannerFilters'
import { FilterToolbar } from './FilterToolbar/FilterToolbar'
import { TaskColumns } from './TaskColumns/TaskColumns'

export const Board = ({ boardId }: { boardId: string }) => {
  return (
    <div className='flex flex-col gap-2 w-5/6'>
      <PlannerFiltersProvider>
        <FilterToolbar boardId={boardId} />
        <TaskColumns boardId={boardId} />
      </PlannerFiltersProvider>
    </div>
  )
}
