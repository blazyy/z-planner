import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Quicksand } from 'next/font/google'
import { AddNewColumnForm } from './AddNewColumnForm'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

type AddNewColumnDialogContentProps = {
  boardId: string
  closeDialog: () => void
}

export const AddNewColumnDialogContent = ({ boardId, closeDialog }: AddNewColumnDialogContentProps) => {
  return (
    <DialogContent className={quicksand.className}>
      <DialogHeader>
        <DialogTitle>Add New Column</DialogTitle>
        <DialogDescription className='pt-4'>
          <AddNewColumnForm boardId={boardId} closeDialog={closeDialog} />
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}
