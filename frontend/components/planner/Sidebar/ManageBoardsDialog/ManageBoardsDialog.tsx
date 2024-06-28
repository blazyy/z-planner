import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { usePlanner } from '@/hooks/Planner/Planner'
import { useEffect, useState } from 'react'
import { AddNewBoardButton } from './AddNewBoardButton'
import { ModifyBoardDialogContent } from './ModifyBoardDialogContent'

export const ManageBoardsDialog = () => {
  const { boardOrder, boards } = usePlanner()

  const [boardBeingModified, setBoardBeingModified] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (boardBeingModified) {
      setIsDialogOpen(true)
    }
  }, [boardBeingModified])

  const closeDialog = () => {
    setIsDialogOpen(false)
    setBoardBeingModified('')
    setKey((prevKey) => prevKey + 1) // Resets unsaved changes in dialog when cancel button is clicked
  }

  return (
    <Dialog
      modal={false}
      open={isDialogOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          closeDialog()
        }
      }}
    >
      <div className='flex flex-col justify-start gap-5 w-full'>
        {/* loop through each board, loop through each category, and display a button for each category */}
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
        {boardBeingModified && (
          <ModifyBoardDialogContent key={key} closeDialog={closeDialog} boardId={boardBeingModified} />
        )}
        <AddNewBoardButton />
      </div>
    </Dialog>
  )
}
