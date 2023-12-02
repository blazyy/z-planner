import { TaskFilterSearchBar } from '../TaskFilterSearchBar'
import { AddNewColumnButton } from './AddNewColumnButton'
import { CategoryFilter } from './CategoryFilter'
import { ResetButton } from './ResetButton'

type FilterToolbarProps = {
  boardId: string
}

export const FilterToolbar = ({ boardId }: FilterToolbarProps) => {
  return (
    <div className='flex gap-2'>
      <TaskFilterSearchBar />
      <CategoryFilter />
      <ResetButton />
      <AddNewColumnButton boardId={boardId} />
    </div>
  )
}
