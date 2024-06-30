import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { BoardInfoType } from '@/hooks/Planner/types'
import { usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'
import { Github } from 'lucide-react'
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
    <div className='flex flex-col items-start gap-8 w-1/6'>
      {/* <EventCalendar /> */}
      {/* <LiveDate /> */}
      <div className='flex flex-col justify-between gap-2 w-full h-full'>
        <div>
          <div className='flex flex-col gap-2 w-full'>
            <span className='mb-2 font-bold text-xl'>Boards</span>
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
        <div>
          <a href='https://github.com/blazyy/z-planner' target='_blank' rel='noopener noreferrer'>
            <Button variant='ghost' className='justify-start mb-2 w-full'>
              <div className='flex items-center gap-2'>
                <Github className='mr-2 w-5 h-5' /> GitHub
              </div>
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
