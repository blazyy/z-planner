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
import deleteCard from '@/utils/plannerUtils/cardUtils/deleteCard'
import { useAuth } from '@clerk/nextjs'
import { Quicksand } from 'next/font/google'
import { useErrorBoundary } from 'react-error-boundary'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

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
      <AlertDialogContent className={quicksand.className}>
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
