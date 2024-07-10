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
import { Button } from '@/components/ui/button'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'

type CancelButtonProps = {
  isFormEmpty: boolean
}

export const CancelButton = ({ isFormEmpty }: CancelButtonProps) => {
  const plannerDispatch = usePlannerDispatch()!
  // If user has entered any input, show confirmation dialog on clicking cancel.
  // Else, directly remove the initializing task.
  if (isFormEmpty)
    return (
      <Button
        type='button'
        variant='destructive'
        size='sm'
        onClick={() => {
          plannerDispatch({
            type: 'taskCardInitializationCancelled',
            payload: null,
          })
          plannerDispatch({
            type: 'dataEnteredInTaskCardBeingInitializedStatusChanged',
            payload: false,
          })
        }}
      >
        Cancel
      </Button>
    )
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type='button' variant='destructive' size='sm'>
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You have a task that&apos;s currently being added. The contents will be lost permanently. Are you sure you
            want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              plannerDispatch({
                type: 'taskCardInitializationCancelled',
              })
              plannerDispatch({
                type: 'dataEnteredInTaskCardBeingInitializedStatusChanged',
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
