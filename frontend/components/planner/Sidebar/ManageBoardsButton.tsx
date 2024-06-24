import { Button } from '@/components/ui/button'
import { IoMdSettings } from 'react-icons/io'

export const ManageBoardsButton = () => {
  return (
    <Button variant='ghost' className='w-full justify-start'>
      <div className='flex gap-2 items-center'>
        <IoMdSettings className='h-5 w-5' />
        Manage Boards
      </div>
    </Button>
  )
}
