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
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { Dispatch, SetStateAction } from 'react'
import { useErrorBoundary } from 'react-error-boundary'

type DeleteBoardConfirmDialogProps = {
  boardId: string
  setBoardBeingModified: Dispatch<SetStateAction<string>>
  closeDialog: () => void
}

export const DeleteBoardConfirmDialog = ({
  boardId,
  setBoardBeingModified,
  closeDialog,
}: DeleteBoardConfirmDialogProps) => {
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size='sm' variant='destructive'>
          Delete
        </Button>
      </AlertDialogTrigger>
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
              setBoardBeingModified('')
              //   deleteCategory(boardId, categoryId, dispatch, showBoundary)
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
