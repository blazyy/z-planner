import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { usePlanner } from '@/hooks/Planner/Planner'
import { BoardsType } from '@/hooks/Planner/types'
import { Dispatch, SetStateAction, useState } from 'react'
import { ManageItemCardDialogWrapper } from '../ManageItemCardDialogWrapper'
import { SectionTitleAndDescription } from '../SectionTitleAndDescription'
import { AddNewBoardButton } from './AddNewBoardButton'
import { ModifyBoardDialogContent } from './ModifyBoardDialogContent'

type BoardsProps = {
  boardOrder: string[]
  boards: BoardsType
  setBoardBeingModified: Dispatch<SetStateAction<string>>
}

const Boards = ({ boardOrder, boards, setBoardBeingModified }: BoardsProps) => {
  return (
    <div className='flex gap-2'>
      {boardOrder.map((boardId) => (
        <DialogTrigger key={boardId} asChild>
          <Button
            variant='secondary'
            onClick={() => {
              setBoardBeingModified(boardId)
            }}
          >
            <span>{boards[boardId].name}</span>
          </Button>
        </DialogTrigger>
      ))}
    </div>
  )
}

export const ManageBoardsCard = () => {
  const { boardOrder, boards } = usePlanner()
  const [boardBeingModified, setBoardBeingModified] = useState('')
  const [key, setKey] = useState(0)
  const conditionToOpenDialog = Boolean(boardBeingModified)

  const onCloseDialog = () => {
    setBoardBeingModified('')
    setKey((prevKey) => prevKey + 1) // Resets unsaved changes in dialog when cancel button is clicked
  }

  return (
    <ManageItemCardDialogWrapper onCloseDialog={onCloseDialog} conditionToOpenDialog={conditionToOpenDialog}>
      <div className='flex flex-col items-start gap-5 w-full'>
        <SectionTitleAndDescription
          title='Boards'
          description='We recommend naming a board after an area of your life, i.e. Work, Home, etc.'
        />
        <div className='flex flex-row gap-2'>
          <Boards boardOrder={boardOrder} boards={boards} setBoardBeingModified={setBoardBeingModified} />
        </div>
        <AddNewBoardButton />
        {conditionToOpenDialog && (
          <ModifyBoardDialogContent key={key} onCloseDialog={onCloseDialog} boardId={boardBeingModified} />
        )}
      </div>
    </ManageItemCardDialogWrapper>
  )
}
