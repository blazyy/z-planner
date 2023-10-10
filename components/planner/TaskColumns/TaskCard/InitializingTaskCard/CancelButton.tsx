import { useAppDispatch } from '@/app/store/hooks'
import { PlannerContext } from '@/components/planner/Planner'
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
import { useContext } from 'react'

type CancelButtonProps = {
  isFormEmpty: boolean
}

export const CancelButton = ({ isFormEmpty }: CancelButtonProps) => {
  const dispatch = useAppDispatch()
  const { setTaskCardBeingInitialized } = useContext(PlannerContext)!
  // If user has entered any input, show confirmation dialog on clicking cancel.
  // Else, directly remove the initializing task.
  if (isFormEmpty)
    return (
      <Button type='button' variant='destructive' onClick={() => setTaskCardBeingInitialized(null)}>
        Cancel
      </Button>
    )
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type='button' variant='destructive'>
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
          <AlertDialogAction onClick={() => setTaskCardBeingInitialized(null)}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
