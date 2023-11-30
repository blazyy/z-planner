import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import * as React from 'react'
import Clock from 'react-live-clock'

export const EventCalendar = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return (
    <div className='flex flex-col gap-2 items-start'>
      <span className='text-2xl ml-2 font-bold'>
        {format(date!, 'EEEE')}, {<Clock format='h:mma' ticking={true} timezone='US/Central' />}
      </span>
      <span className='text-2xl ml-2'></span>
      <Calendar mode='single' selected={date} onSelect={setDate} className='rounded-md border shadow w-min' />
    </div>
  )
}
