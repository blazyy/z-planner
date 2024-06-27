import { usePlanner } from '@/hooks/Planner/Planner'
import { ManagingCategoriesView } from '../../Sidebar/ManageCategoriesDialog/ManageCategoriesDialog'

export const ManagingView = () => {
  const { currentView } = usePlanner()
  return (
    <div className='flex flex-col w-10/12 h-full'>
      {currentView === 'manageCategories' && <ManagingCategoriesView />}
    </div>
  )
}
