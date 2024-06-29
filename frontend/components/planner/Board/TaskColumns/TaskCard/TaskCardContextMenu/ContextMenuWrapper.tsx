import deleteCard from '@/app/utils/plannerUtils/cardUtils/deleteCard'
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
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { useErrorBoundary } from 'react-error-boundary'

type ContextMenuWrapperProps = {
  columnId: string
  taskCardId: string
  children: JSX.Element
}

export const ContextMenuWrapper = ({ columnId, taskCardId, children }: ContextMenuWrapperProps) => {
  const { getToken } = useAuth()
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
  return (
    <AlertDialog>
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
              deleteCard(columnId, taskCardId, dispatch, getToken)
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
