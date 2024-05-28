import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { BoardInfoType } from '@/hooks/Planner/types'
import { usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'
import { useState } from 'react'
import { HiOutlinePlus } from 'react-icons/hi'
import { AddNewBoardForm } from './AddNewBoardForm'
import { ManageBoardsButton } from './ManageBoardsButton'

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
      className={`w-full justify-start ${isCurrentlySelectedBoard ? 'border-l-4 border-green-500' : ''}`}
      onClick={() => {
        dispatch({ type: 'selectedBoardChanged', payload: { boardId: board.id } })
        filtersDispatch({ type: 'filtersReset' })
      }}
    >
      {board.name}
    </Button>
  )
}

export const Sidebar = () => {
  const [addingNewBoard, setAddingNewBoard] = useState(false)
  const { boardOrder, boards } = usePlanner()

  return (
    <div className='flex flex-col w-2/12 gap-8 items-start'>
      {/* <div className='flex flex-col gap-2 items-start justify-center'>
        <LiveDate />
        <EventCalendar />
      </div> */}
      <div className='flex flex-col w-full gap-2'>
        <span className='mb-4 text-xl font-bold'>Boards</span>
        {boardOrder.map((boardId, i) => (
          <BoardButton key={i} board={boards[boardId]} />
        ))}
        {addingNewBoard && <AddNewBoardForm setAddingNewBoard={setAddingNewBoard} />}
        <Separator />
        <Button variant='ghost' className='w-full justify-start' onClick={() => setAddingNewBoard(true)}>
          <div className='flex gap-2 items-center'>
            <HiOutlinePlus className='h-5 w-5' />
            Add New Board
          </div>
        </Button>
        {boardOrder.length > 0 && <ManageBoardsButton />}
      </div>
    </div>
  )
}
