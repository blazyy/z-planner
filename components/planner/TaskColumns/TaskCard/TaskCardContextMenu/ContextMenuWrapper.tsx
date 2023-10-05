import { produce } from 'immer'
import { useContext } from 'react'

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
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'

import { PlannerContext } from '../../TaskColumns'

type ContextMenuWrapperProps = {
  columnId: string
  taskCardId: string
  children: JSX.Element
}

export const ContextMenuWrapper = ({ columnId, taskCardId, children }: ContextMenuWrapperProps) => {
  const { toast } = useToast()
  const { setData } = useContext(PlannerContext)!
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
              setData(
                produce((draft) => {
                  draft.columns[columnId].cardIds = draft.columns[columnId].cardIds.filter(
                    (cardId) => cardId !== taskCardId
                  )
                  delete draft.taskCards[taskCardId]
                })
              )
              toast({
                title: 'Deleted task',
                // description: 'Friday, February 10, 2023 at 5:57 PM',
                action: (
                  <ToastAction altText='Undo'>
                    <div className='flex gap-2'>
                      <span>Undo</span>
                      <span className='text-gray-400'> ⌘Z</span>
                    </div>
                  </ToastAction>
                ),
              })
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
