import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { BoardInfoType } from '@/hooks/Planner/types'
import { usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'
import { useState } from 'react'
import { HiOutlinePlus } from 'react-icons/hi'
import { AddNewBoardForm } from './AddNewBoardForm'
import { EventCalendar } from './EventCalendar'
import { ManageCategoriesButton } from './ManageCategoriesButton'
import { ManagePlannerButton } from './ManagePlannerButton'

type BoardButtonProps = {
  board: BoardInfoType
}

const BoardButton = ({ board }: BoardButtonProps) => {
  const { selectedBoard, currentView } = usePlanner()
  const dispatch = usePlannerDispatch()
  const filtersDispatch = usePlannerFiltersDispatch()
  const isCurrentlySelectedBoard = selectedBoard === board.id && currentView === 'board'
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
  const [addingNewBoard, setAddingNewBoard] = useState(false)
  const { boardOrder, boards } = usePlanner()

  return (
    <div className='flex flex-col items-start gap-8 w-72'>
      <EventCalendar />
      {/* <LiveDate /> */}
      <div className='flex flex-col gap-2 w-full'>
        <span className='mb-4 font-bold text-xl'>Boards</span>
        {boardOrder.map((boardId, i) => (
          <BoardButton key={i} board={boards[boardId]} />
        ))}
        {addingNewBoard && <AddNewBoardForm setAddingNewBoard={setAddingNewBoard} />}
        <Separator />
        <Button variant='ghost' className='justify-start w-full' onClick={() => setAddingNewBoard(true)}>
          <div className='flex items-center gap-2'>
            <HiOutlinePlus className='w-5 h-5' />
            Add New Board
          </div>
        </Button>
        <ManagePlannerButton />
        <ManageCategoriesButton />
      </div>
    </div>
  )
}
