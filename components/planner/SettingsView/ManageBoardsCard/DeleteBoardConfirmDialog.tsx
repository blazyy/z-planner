import deleteBoard from '@/app/utils/plannerUtils/boardUtils/deleteBoard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useState } from 'react'

type DeleteBoardConfirmDialogProps = {
  boardId: string
  closeDialog: () => void
}

export const DeleteBoardConfirmDialog = ({ boardId, closeDialog }: DeleteBoardConfirmDialogProps) => {
  const { getToken } = useAuth()
  const dispatch = usePlannerDispatch()
  const { boards, columns } = usePlanner()
  const boardHasTasks = boards[boardId].columns.reduce((acc, col) => acc + columns[col].taskCards.length, 0) > 0
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)

  return (
    <AlertDialog
      open={isAlertDialogOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setIsAlertDialogOpen(false)
        }
        // https://github.com/shadcn-ui/ui/issues/1912#issuecomment-2187447622
        // The setTimeout is a workaround for a bug where after you clicked on an action on the alert dialog,
        // both dialogs would close but the page would become unresponsive-- you couldn't click on anything.
        setTimeout(() => {
          if (!newOpen) {
            document.body.style.pointerEvents = ''
          }
        }, 100)
      }}
    >
      <div className='flex justify-between items-end gap-2'>
        {!boardHasTasks && (
          <Button size='sm' variant='destructive' disabled={boardHasTasks} onClick={() => setIsAlertDialogOpen(true)}>
            Delete
          </Button>
        )}
        {boardHasTasks && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className='cursor-default'>
                <Button size='sm' variant='destructive' disabled={boardHasTasks}>
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>A board with tasks cannot be deleted.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            onClick={() => {
              deleteBoard(boardId, dispatch, getToken)
              closeDialog()
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
