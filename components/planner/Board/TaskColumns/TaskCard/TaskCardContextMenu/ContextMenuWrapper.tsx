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
  boardId: string
  columnId: string
  taskCardId: string
  children: React.ReactNode
}

export const ContextMenuWrapper = ({ boardId, columnId, taskCardId, children }: ContextMenuWrapperProps) => {
  const dispatch = usePlannerDispatch()
  return (
    <AlertDialog>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            onClick={() => {
              deleteCard(columnId, taskCardId, dispatch, boardId)
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
