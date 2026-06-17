import localFont from 'next/font/local'

import { cn } from '@/lib/utils'

const calsans = localFont({
  src: '../../../assets/fonts/CalSans-SemiBold.woff2',
})

export function SiteLogo() {
  return (
    <div className='flex items-center gap-2'>
      <span className={cn(calsans.className, 'text-xl ml-4')}>z planner</span>
      <span className='text-slate-600 dark:text-slate-400 tracking-widest'>BETA</span>
    </div>
  )
}
