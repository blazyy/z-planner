import { toast } from 'sonner'

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
import { usePlannerDispatch, usePlannerStore } from '@/hooks/Planner/Planner'
import deleteCard, { restoreCard } from '@/utils/plannerUtils/cardUtils/deleteCard'

const UNDO_TOAST_DURATION_MS = 5000

type ContextMenuWrapperProps = {
  boardId: string
  columnId: string
  taskCardId: string
  children: React.ReactNode
}

export const ContextMenuWrapper = ({ boardId, columnId, taskCardId, children }: ContextMenuWrapperProps) => {
  const dispatch = usePlannerDispatch()
  const store = usePlannerStore()

  const handleDelete = () => {
    // Capture the card's full data + its original index BEFORE the optimistic
    // delete dispatch mutates the store, so undo can re-insert it exactly.
    const stateBefore = store.getState()
    const deletedCard = stateBefore.taskCards[taskCardId]
    const originalIndex = stateBefore.columns[columnId]?.taskCards.indexOf(taskCardId) ?? -1

    deleteCard(columnId, taskCardId, dispatch, boardId)

    // Card data couldn't be captured (shouldn't happen via the UI) — keep the
    // delete behavior but skip the undo affordance rather than restore garbage.
    if (!deletedCard || originalIndex < 0) {
      return
    }

    toast('Task deleted', {
      duration: UNDO_TOAST_DURATION_MS,
      action: {
        label: 'Undo',
        onClick: () => {
          // Read the column order AS IT IS NOW so the splice lands relative to
          // any cards added/removed while the toast was up.
          const currentTaskCards = store.getState().columns[columnId]?.taskCards ?? []
          restoreCard(columnId, deletedCard, originalIndex, currentTaskCards, dispatch, boardId)
        },
      },
    })
  }

  return (
    <AlertDialog>
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete task?</AlertDialogTitle>
          <AlertDialogDescription>You&apos;ll have a few seconds to undo this.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant='destructive' onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
