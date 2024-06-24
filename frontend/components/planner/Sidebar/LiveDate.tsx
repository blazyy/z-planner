import { format } from 'date-fns'
import Clock from 'react-live-clock'

export const LiveDate = () => {
  const date = new Date()
  return (
    <span className='text-2xl ml-2 font-bold font-mono'>
      {format(date!, 'EEEE')}, {<Clock format='hh:mm a' ticking={true} timezone='US/Central' />}
    </span>
  )
}
