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
import { useAuth } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Dispatch, SetStateAction } from 'react'

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
  const dispatch = usePlannerDispatch()
  const { getToken } = useAuth()

  const deleteCategoryMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/boards/${boardId}/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },
    onMutate: async () => {
      dispatch({
        type: 'categoryDeleted',
        payload: {
          boardId,
          categoryId,
        },
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
              setDetailsOfCategoryBeingModified({
                boardId: '',
                categoryId: '',
              })
              deleteCategoryMutation.mutate()
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
