import { usePlanner } from '@/hooks/Planner/Planner'
import { AddNewColumnButton } from '../TaskColumns/AddNewColumnButton'
import { TaskFilterSearchBar } from '../TaskFilterSearchBar'
import { CategoryFilter } from './CategoryFilter'
import { DateFilterDisplay } from './DateFilterDisplay'
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
        <div className='flex justify-start gap-2 w-full'>
          <TaskFilterSearchBar />
          <DateFilterDisplay />
          <CategoryFilter selectedBoard={boardId} />
          <ResetButton />
          <AddNewColumnButton key={boardId} boardId={boardId} />
        </div>
      )}
      {numTaskCardsInBoard === 0 && (
        <div className='flex justify-start gap-2 w-full'>
          <AddNewColumnButton key={boardId} boardId={boardId} />
        </div>
      )}
    </div>
  )
}
