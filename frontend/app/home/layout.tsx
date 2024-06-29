import { Navbar } from '@/components/global/Navbar'
import { cn } from '@/lib/utils'
import { quicksand } from '../layout'

export default function Layout({ children }: { children: JSX.Element }) {
  return (
    <div className={cn(quicksand.className, 'flex flex-col min-h-screen')}>
      <Navbar />
      {children}
    </div>
  )
}
