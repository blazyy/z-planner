import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Quicksand } from 'next/font/google'
import { AddNewCategoryForm } from './AddNewCategoryForm'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

type AddNewCategoryDialogContentProps = {
  closeDialog: () => void
}

export const AddNewCategoryDialogContent = ({ closeDialog }: AddNewCategoryDialogContentProps) => {
  return (
    <DialogContent className={quicksand.className}>
      <DialogHeader>
        <DialogTitle className='mb-5'>Add New Category</DialogTitle>
        <DialogDescription>
          <AddNewCategoryForm closeDialog={closeDialog} />
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
