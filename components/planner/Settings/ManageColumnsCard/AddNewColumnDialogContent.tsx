import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AddNewColumnForm } from './AddNewColumnForm'

type AddNewColumnDialogContentProps = {
  boardId: string
  closeDialog: () => void
}

export const AddNewColumnDialogContent = ({ boardId, closeDialog }: AddNewColumnDialogContentProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Column</DialogTitle>
        <DialogDescription className='pt-4'>
          <AddNewColumnForm boardId={boardId} closeDialog={closeDialog} />
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
