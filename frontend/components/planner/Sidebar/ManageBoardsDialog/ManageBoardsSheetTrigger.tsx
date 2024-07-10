import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Kanban } from 'lucide-react'
import { ManageBoardsDialog } from './ManageBoardsDialog'

export const ManageBoardsSheetTrigger = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' className='justify-start w-full'>
          <div className='flex items-center gap-2'>
            <Kanban className='w-5 h-5' />
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
