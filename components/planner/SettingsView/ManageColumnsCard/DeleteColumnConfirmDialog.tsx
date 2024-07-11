import deleteColumn from '@/app/utils/plannerUtils/columnUtils/deleteColumn'
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

type DeleteColumnConfirmDialogProps = {
  boardId: string
  columnId: string
  closeDialog: () => void
}

export const DeleteColumnConfirmDialog = ({ boardId, columnId, closeDialog }: DeleteColumnConfirmDialogProps) => {
  const { getToken } = useAuth()
  const { columns } = usePlanner()
  const dispatch = usePlannerDispatch()
  const columnsHasTasks = columns[columnId].taskCards.length > 0
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
        {!columnsHasTasks && (
          <Button size='sm' variant='destructive' disabled={columnsHasTasks} onClick={() => setIsAlertDialogOpen(true)}>
            Delete
          </Button>
        )}
        {columnsHasTasks && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className='cursor-default'>
                <Button size='sm' variant='destructive' disabled={columnsHasTasks}>
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>A column with tasks cannot be deleted.</p>
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
              deleteColumn(boardId, columnId, dispatch, getToken)
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
