import { usePlanner } from '@/hooks/Planner/Planner'
import { TaskFilterSearchBar } from '../TaskFilterSearchBar'
import { AddNewColumnButton } from './AddNewColumnButton'
import { CategoryFilter } from './CategoryFilter'
import { ResetButton } from './ResetButton'

type FilterToolbarProps = {
  boardId: string
}

export const FilterToolbar = ({ boardId }: FilterToolbarProps) => {
  const { boards, columns } = usePlanner()
  const numTaskCardsInBoard = boards[boardId].columns.reduce((acc, col) => acc + columns[col].taskCards.length, 0)

  return (
    <div className='flex gap-2 ml-2'>
      {numTaskCardsInBoard > 0 && (
        <>
          <TaskFilterSearchBar />
          <CategoryFilter />
          <ResetButton />
        </>
      )}
      <AddNewColumnButton key={boardId} boardId={boardId} />
    </div>
  )
}
