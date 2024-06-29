import { calsans } from '@/app/home/layout'
import { cn } from '@/lib/utils'

export function SiteLogo() {
  return (
    <div className='flex items-center gap-2'>
      <span className={cn(calsans.className, 'text-2xl ml-4')}>zenith planner</span>
      <span className='text-slate-600 tracking-widest'>BETA</span>
    </div>
  )
}
