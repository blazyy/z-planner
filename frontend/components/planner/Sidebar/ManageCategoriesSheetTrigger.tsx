import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { IoMdSettings } from 'react-icons/io'
import { ManageCategoriesDialog } from './ManageCategoriesDialog/ManageCategoriesDialog'

export const ManageCategoriesSheetTrigger = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' className='justify-start w-full'>
          <div className='flex items-center gap-2'>
            <IoMdSettings className='w-5 h-5' />
            Manage Categories
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[500px]'>
        <SheetHeader>
          <SheetTitle className='mb-4 text-2xl'>Manage Categories</SheetTitle>
        </SheetHeader>
        <ManageCategoriesDialog />
      </SheetContent>
    </Sheet>
  )
}
