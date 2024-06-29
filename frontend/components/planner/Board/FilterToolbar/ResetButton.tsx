import { Button } from '@/components/ui/button'
import { usePlannerFilters, usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'
import { RxCross1 } from 'react-icons/rx'
import { areDatesEqual } from '../TaskColumns/helpers'

export const ResetButton = () => {
  const { selectedCategories, searchQuery, dateFilter } = usePlannerFilters()
  const dispatch = usePlannerFiltersDispatch()
  if (selectedCategories.length > 0 || searchQuery !== '' || (dateFilter && !areDatesEqual(new Date(), dateFilter))) {
    return (
      <Button variant='secondary' onClick={() => dispatch({ type: 'filtersReset' })}>
        <div className='flex items-center gap-2'>
          <span>Reset Filters</span>
          <RxCross1 className='w-4 h-4' />
        </div>
      </Button>
    )
  }
}
