import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AddNewCategoryDialogContent } from './AddNewCategoryDialogContent'

export const AddNewCategoryButton = () => {
  const [key, setKey] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const closeDialog = () => {
    setIsDialogOpen(false)
    setKey((prevKey) => prevKey + 1) // Resets unsaved changes in dialog when cancel button is clicked
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(newOpen) => {
        // Used to call custom closeDialog function when dialog is closed, this resets unsaved changes in dialog when closed
        setIsDialogOpen(newOpen)
        if (!newOpen) {
          closeDialog()
        }
      }}
    >
      <DialogTrigger>
        <div className='flex justify-between items-start'>
          <Button className='w-full' variant='outline'>
            <Plus className='mr-2 w-4 h-4' /> Add a new category
          </Button>
        </div>
      </DialogTrigger>
      <AddNewCategoryDialogContent key={key} closeDialog={closeDialog} />
    </Dialog>
  )
}
