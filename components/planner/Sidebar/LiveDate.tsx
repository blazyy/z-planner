import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Clock from 'react-live-clock'

export const LiveDate = () => {
  const date = new Date()
  return (
    <span className={cn('ml-2 font-bold  text-2xl')}>
      {format(date!, 'EEEE')}, {<Clock format='MMM Do' ticking={true} timezone='US/Central' />}
    </span>
  )
}
