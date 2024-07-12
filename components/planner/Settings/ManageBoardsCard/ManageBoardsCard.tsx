import { Button } from '@/components/ui/button'
import { DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { usePlanner } from '@/hooks/Planner/Planner'
import { useState } from 'react'
import { ManageItemCardDialogWrapper } from '../ManageItemCardDialogWrapper'
import { AddNewBoardButton } from './AddNewBoardButton'
import { ModifyBoardDialogContent } from './ModifyBoardDialogContent'

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
      <div className='flex flex-col justify-between gap-5 border-slate-200 p-5 border rounded-md w-1/4'>
        <div className='flex flex-col justify-start gap-5 w-full'>
          <div className='flex flex-col'>
            <span className='font-bold text-lg'>Manage Boards</span>
            <span className='text-muted-foreground text-sm'>
              We recommend naming a board after an area of your life, i.e. Work, Home, etc.
            </span>
          </div>
          <Separator />
          <div className='flex flex-col gap-2 w-full'>
            {boardOrder.map((boardId) => {
              return (
                <div key={boardId} className='flex flex-col gap-2 w-full'>
                  <DialogTrigger asChild>
                    <Button
                      className='pl-2 w-full'
                      variant='secondary'
                      onClick={() => {
                        setBoardBeingModified(boardId)
                      }}
                    >
                      <span>{boards[boardId].name}</span>
                    </Button>
                  </DialogTrigger>
                </div>
              )
            })}
          </div>
          {conditionToOpenDialog && (
            <ModifyBoardDialogContent key={key} onCloseDialog={onCloseDialog} boardId={boardBeingModified} />
          )}
        </div>
        <AddNewBoardButton />
      </div>
    </ManageItemCardDialogWrapper>
  )
}
