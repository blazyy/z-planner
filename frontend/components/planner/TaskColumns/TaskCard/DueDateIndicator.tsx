import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import * as React from 'react'
import { MdCalendarToday } from 'react-icons/md'

export const DueDateIndicator = () => {
  const [date, setDate] = React.useState(new Date())

  return (
    <Popover>
      <PopoverTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div className='flex flex-row items-center p-1 border-solid border-[1px] rounded-lg border-slate-300'>
          <MdCalendarToday className='mr-2 text-slate-500' />
          <span className='text-xs text-slate-500'>{date ? format(date, 'PP') : 'Pick a date'}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(e) => {
            console.log(e)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
