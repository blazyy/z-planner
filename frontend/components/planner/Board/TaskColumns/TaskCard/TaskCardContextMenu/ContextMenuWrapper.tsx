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
import { Toaster } from '@/components/ui/toaster'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

type ContextMenuWrapperProps = {
  columnId: string
  taskCardId: string
  children: JSX.Element
}

export const ContextMenuWrapper = ({ columnId, taskCardId, children }: ContextMenuWrapperProps) => {
  const dispatch = usePlannerDispatch()
  const { getToken } = useAuth()

  const deleteCardMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/planner/columns/${columnId}/cards/${taskCardId}/delete`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    },
    onMutate: async () => {
      dispatch({
        type: 'taskCardDeleted',
        payload: {
          columnId,
          taskCardId,
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
      <Toaster />
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete your task permanently and it cannot be recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteCardMutation.mutate()
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
