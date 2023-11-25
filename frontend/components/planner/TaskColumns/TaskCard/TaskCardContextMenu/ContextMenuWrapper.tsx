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
import { ToastAction } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { useErrorBoundary } from 'react-error-boundary'

type ContextMenuWrapperProps = {
  columnId: string
  taskCardId: string
  children: JSX.Element
}

export const ContextMenuWrapper = ({ columnId, taskCardId, children }: ContextMenuWrapperProps) => {
  const { toast } = useToast()
  const dispatch = usePlannerDispatch()
  const { showBoundary } = useErrorBoundary()
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
              deleteCard(columnId, taskCardId, dispatch, showBoundary)
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
