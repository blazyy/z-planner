import { usePlanner } from '@/hooks/Planner/Planner'
import { TaskFilterSearchBar } from '../TaskFilterSearchBar'
import { AreaSelector } from './AreaSelector'
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
    <div className='flex items-center gap-2 ml-2'>
      {numTaskCardsInBoard > 0 && (
        <>
          <AreaSelector />
          <TaskFilterSearchBar />
          <DateFilterDisplay />
          <CategoryFilter />
          <ResetButton />
        </>
      )}
    </div>
  )
}
