import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { BoardInfoType } from '@/hooks/Planner/types'
import { usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'
import { ManageBoardsSheetTrigger } from './ManageBoardsSheetTrigger'
import { ManageCategoriesSheetTrigger } from './ManageCategoriesSheetTrigger'

type BoardButtonProps = {
  board: BoardInfoType
}

const BoardButton = ({ board }: BoardButtonProps) => {
  const { selectedBoard } = usePlanner()
  const dispatch = usePlannerDispatch()
  const filtersDispatch = usePlannerFiltersDispatch()
  const isCurrentlySelectedBoard = selectedBoard === board.id
  return (
    <Button
      variant={isCurrentlySelectedBoard ? 'secondary' : 'ghost'}
      className={`${isCurrentlySelectedBoard ? 'border-l-4 border-green-500' : ''}`}
      onClick={() => {
        dispatch({ type: 'selectedBoardChanged', payload: { boardId: board.id } })
        filtersDispatch({ type: 'filtersReset' })
      }}
    >
      <div className='flex justify-between gap-2 w-full'>
        <div className='flex'>{board.name}</div>
      </div>
    </Button>
  )
}

export const Sidebar = () => {
  const { boardOrder, boards } = usePlanner()

  return (
    <div className='flex flex-col items-start gap-8 w-72'>
      {/* <EventCalendar /> */}
      {/* <LiveDate /> */}
      <div className='flex flex-col justify-start gap-2 w-full h-full'>
        <div className='flex flex-col gap-2 w-full'>
          <span className='mb-4 font-bold text-xl'>Boards</span>
          {boardOrder.map((boardId, i) => (
            <BoardButton key={i} board={boards[boardId]} />
          ))}
        </div>
        <div className='flex flex-col gap-2 mt-5 w-full'>
          <Separator />
          <ManageBoardsSheetTrigger />
          <ManageCategoriesSheetTrigger />
        </div>
      </div>
    </div>
  )
}
