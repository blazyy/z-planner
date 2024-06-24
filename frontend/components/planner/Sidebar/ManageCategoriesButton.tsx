import { Button } from '@/components/ui/button'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { IoMdSettings } from 'react-icons/io'

export const ManageCategoriesButton = () => {
  const dispatch = usePlannerDispatch()
  const { currentView } = usePlanner()
  const isSelected = currentView === 'manageCategories'
  return (
    <Button
      variant={isSelected ? 'secondary' : 'ghost'}
      className='justify-start w-full'
      onClick={() => dispatch({ type: 'isManagingCategories' })}
    >
      <div className='flex items-center gap-2'>
        <IoMdSettings className='w-5 h-5' />
        Manage Categories
      </div>
    </Button>
  )
}
