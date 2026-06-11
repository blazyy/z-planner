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

type ContextMenuWrapperProps = {
  columnId: string
  taskCardId: string
  children: React.ReactNode
}

export const ContextMenuWrapper = ({ columnId, taskCardId, children }: ContextMenuWrapperProps) => {
  const dispatch = usePlannerDispatch()
  return (
    <AlertDialog>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This will delete your task permanently.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              deleteCard(columnId, taskCardId, dispatch)
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
