import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { IoMdSettings } from 'react-icons/io'
import { ManageBoardsDialog } from './ManageBoardsDialog/ManageBoardsDialog'

export const ManageBoardsSheetTrigger = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' className='justify-start w-full'>
          <div className='flex items-center gap-2'>
            <IoMdSettings className='w-5 h-5' />
            Manage Boards
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[500px]'>
        <SheetHeader>
          <SheetTitle className='mb-4 text-2xl'>Manage Boards</SheetTitle>
        </SheetHeader>
        <ManageBoardsDialog />
      </SheetContent>
    </Sheet>
  )
}
