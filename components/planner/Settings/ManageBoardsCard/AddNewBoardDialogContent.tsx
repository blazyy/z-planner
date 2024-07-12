import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Quicksand } from 'next/font/google'
import { AddNewBoardForm } from './AddNewBoardForm'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

type AddNewBoardDialogContentProps = {
  closeDialog: () => void
}

export const AddNewBoardDialogContent = ({ closeDialog }: AddNewBoardDialogContentProps) => {
  return (
    <DialogContent className={quicksand.className}>
      <DialogHeader>
        <DialogTitle>Add New Board</DialogTitle>
        <DialogDescription className='pt-4'>
          <AddNewBoardForm closeDialog={closeDialog} />
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
