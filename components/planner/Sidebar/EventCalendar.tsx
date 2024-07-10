import { Calendar } from '@/components/ui/calendar'
import { usePlannerFilters, usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'

export const EventCalendar = () => {
  const { dateFilter } = usePlannerFilters()
  const plannerFiltersDispatch = usePlannerFiltersDispatch()

  const dateFilterChangeHandler = (newDate: Date | null) => {
    plannerFiltersDispatch({ type: 'dateFilterChanged', payload: { newDate } })
  }

  return (
    <Calendar
      mode='single'
      selected={dateFilter ?? new Date()}
      onSelect={(selectedDate) => {
        if (selectedDate) {
          if (selectedDate === dateFilter) {
            dateFilterChangeHandler(null)
          }
          dateFilterChangeHandler(selectedDate)
        }
      }}
      className='shadow border rounded-md'
    />
  )
}
