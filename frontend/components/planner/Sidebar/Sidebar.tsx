import { Button } from '@/components/ui/button'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { BoardInfoType } from '@/hooks/Planner/types'
import { useState } from 'react'
import { HiOutlinePlus } from 'react-icons/hi'
import { AddNewBoardButton } from './AddNewBoardButton'

type BoardButtonProps = {
  board: BoardInfoType
}

const BoardButton = ({ board }: BoardButtonProps) => {
  const { selectedBoard } = usePlanner()
  const dispatch = usePlannerDispatch()
  return (
    <Button
      variant={selectedBoard === board.id ? 'secondary' : 'ghost'}
      className='w-full justify-start'
      onClick={() => dispatch({ type: 'selectedBoardChanged', payload: { boardId: board.id } })}
    >
      {board.name}
    </Button>
  )
}

export const Sidebar = () => {
  const [addingNewBoard, setAddingNewBoard] = useState(false)
  const { boardOrder, boards } = usePlanner()

  return (
    <div className='flex flex-col w-96 gap-2'>
      <span className='mb-4 text-xl font-bold transition-all hover:bg-accent hover:text-accent-foreground'>Boards</span>
      {boardOrder.map((boardId, i) => (
        <BoardButton key={i} board={boards[boardId]} />
      ))}
      {!addingNewBoard && (
        <Button variant='ghost' className='w-full justify-start' onClick={() => setAddingNewBoard(true)}>
          <div className='flex gap-2 items-center'>
            <HiOutlinePlus className='h-5 w-5' />
            Add New Board
          </div>
        </Button>
      )}
      {addingNewBoard && <AddNewBoardButton setAddingNewBoard={setAddingNewBoard} />}
    </div>
  )
}
