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
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

type DeleteBoardConfirmDialogProps = {
  boardId: string
  closeDialog: () => void
}

export const DeleteBoardConfirmDialog = ({ boardId, closeDialog }: DeleteBoardConfirmDialogProps) => {
  const dispatch = usePlannerDispatch()
  const { boards, columns } = usePlanner()
  const boardHasTasks = boards[boardId].columns.reduce((acc, col) => acc + columns[col].taskCards.length, 0) > 0
  const { getToken } = useAuth()

  const deleteBoardMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onMutate: async () => {
      dispatch({
        type: 'boardDeleted',
        payload: { boardId },
      })
    },
    onError: (err) => {
      dispatch({
        type: 'backendErrorOccurred',
      })
    },
  })

  return (
    <AlertDialog>
      <div className='flex justify-between items-end gap-2'>
        {!boardHasTasks && (
          <AlertDialogTrigger asChild>
            <Button size='sm' variant='destructive' disabled={boardHasTasks}>
              Delete
            </Button>
          </AlertDialogTrigger>
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
              deleteBoardMutation.mutate()
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
