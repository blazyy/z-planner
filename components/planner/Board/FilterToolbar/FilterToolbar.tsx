import { AddNewColumnButton } from '../TaskColumns/AddNewColumnButton'
import { TaskFilterSearchBar } from '../TaskFilterSearchBar'
import { CategoryFilter } from './CategoryFilter'
import { ResetButton } from './ResetButton'

export const FilterToolbar = ({ boardId }: { boardId: string }) => {
  return (
    <div className='flex justify-start items-center gap-2 w-full'>
      <TaskFilterSearchBar />
      <CategoryFilter selectedBoard={boardId} />
      <ResetButton />
      <AddNewColumnButton key={boardId} boardId={boardId} />
    </div>
  )
}
