import { Button } from '@/components/ui/button'
import { usePlannerDispatch } from '@/hooks/Planner/Planner'
import { IoMdSettings } from 'react-icons/io'

export const ManageCategoriesButton = () => {
  const dispatch = usePlannerDispatch()
  return (
    <Button variant='ghost' className='justify-start w-full' onClick={() => dispatch({ type: 'isManagingCategories' })}>
      <div className='flex items-center gap-2'>
        <IoMdSettings className='w-5 h-5' />
        Manage Categories
      </div>
    </Button>
  )
}
