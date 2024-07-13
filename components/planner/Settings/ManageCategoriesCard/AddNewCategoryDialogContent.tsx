import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AddNewCategoryForm } from './AddNewCategoryForm'

type AddNewCategoryDialogContentProps = {
  closeDialog: () => void
}

export const AddNewCategoryDialogContent = ({ closeDialog }: AddNewCategoryDialogContentProps) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='mb-5'>Add New Category</DialogTitle>
        <DialogDescription>
          <AddNewCategoryForm closeDialog={closeDialog} />
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
