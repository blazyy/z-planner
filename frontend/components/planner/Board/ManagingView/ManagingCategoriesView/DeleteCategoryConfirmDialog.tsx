import deleteCategory from '@/app/utils/plannerUtils/categoryUtils/deleteCategory'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UNASSIGNED_CATEGORY_NAME } from '@/constants/constants'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { Dispatch, SetStateAction } from 'react'
import { useErrorBoundary } from 'react-error-boundary'

type DeleteCategoryConfirmDialogProps = {
  categoryId: string
  setCategoryBeingModified: Dispatch<SetStateAction<string>>
  closeDialog: () => void
}

export const DeleteCategoryConfirmDialog = ({
  categoryId,
  setCategoryBeingModified,
  closeDialog,
}: DeleteCategoryConfirmDialogProps) => {
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
          <AlertDialogDescription>
            This action cannot be undone. Any tasks with this category will be moved to
            {<Badge className='bg-slate-500 hover:bg-slate-700 m-1 text-white'>{UNASSIGNED_CATEGORY_NAME}</Badge>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            onClick={() => {
              setCategoryBeingModified('')
              deleteCategory(categoryId, dispatch, showBoundary)
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
