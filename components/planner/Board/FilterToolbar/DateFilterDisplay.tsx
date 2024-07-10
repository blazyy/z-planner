import { Button } from '@/components/ui/button'
import { usePlannerFilters } from '@/hooks/PlannerFilters/PlannerFilters'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { areDatesEqual } from '../TaskColumns/helpers'

export const DateFilterDisplay = () => {
  const { dateFilter } = usePlannerFilters()
  if (!dateFilter || areDatesEqual(new Date(), dateFilter)) {
    return null
  }
  return (
    <Button variant={'outline'} className={cn('justify-start text-left font-normal text-muted-foreground ')}>
      <CalendarIcon className='mr-2 w-4 h-4' />
      Tasks due {format(dateFilter, 'MMM do')}
    </Button>
  )
}
