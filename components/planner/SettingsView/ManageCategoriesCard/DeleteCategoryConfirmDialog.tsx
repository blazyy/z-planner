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
import deleteCategory from '@/utils/plannerUtils/categoryUtils/deleteCategory'
import { useAuth } from '@clerk/nextjs'
import { Dispatch, SetStateAction, useState } from 'react'

type DeleteCategoryConfirmDialogProps = {
  boardId: string
  categoryId: string
  setDetailsOfCategoryBeingModified: Dispatch<SetStateAction<{ boardId: string; categoryId: string }>>
  closeDialog: () => void
}

export const DeleteCategoryConfirmDialog = ({
  boardId,
  categoryId,
  setDetailsOfCategoryBeingModified,
  closeDialog,
}: DeleteCategoryConfirmDialogProps) => {
  const { getToken } = useAuth()
  const dispatch = usePlannerDispatch()
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
      <AlertDialogTrigger asChild>
        <Button size='sm' variant='destructive' onClick={() => setIsAlertDialogOpen(true)}>
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
              setDetailsOfCategoryBeingModified({
                boardId: '',
                categoryId: '',
              })
              deleteCategory(boardId, categoryId, dispatch, getToken)
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
