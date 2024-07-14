import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AddNewBoardForm } from './AddNewBoardForm'

export const AddNewBoardDialogContent = ({ closeDialog }: { closeDialog: () => void }) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Board</DialogTitle>
        <DialogDescription className='pt-4'>
          <AddNewBoardForm closeDialog={closeDialog} />
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
