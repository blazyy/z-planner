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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'

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

  return (
    <AlertDialog>
      <div className='flex justify-between items-end gap-2'>
        {!columnsHasTasks && (
          <AlertDialogTrigger asChild>
            <Button size='sm' variant='destructive' disabled={columnsHasTasks}>
              Delete
            </Button>
          </AlertDialogTrigger>
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
