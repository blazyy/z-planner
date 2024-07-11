import { PlannerFiltersProvider } from '@/hooks/PlannerFilters/PlannerFilters'
import { FilterToolbar } from './FilterToolbar/FilterToolbar'
import { TaskColumns } from './TaskColumns/TaskColumns'

type BoardProps = {
  boardId: string
}

export const Board = ({ boardId }: BoardProps) => {
  return (
    <div className='flex flex-col w-5/6'>
      <PlannerFiltersProvider>
        <FilterToolbar boardId={boardId} />
        <TaskColumns boardId={boardId} />
      </PlannerFiltersProvider>
    </div>
  )
}
