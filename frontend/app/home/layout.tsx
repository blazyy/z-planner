import { Navbar } from '@/components/global/Navbar'
import { cn } from '@/lib/utils'
import { Quicksand } from 'next/font/google'
import localFont from 'next/font/local'

export const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })
export const calsans = localFont({
  src: '../../assets/fonts/CalSans-SemiBold.woff2',
})

export default function Layout({ children }: { children: JSX.Element }) {
  return (
    <div className={cn(quicksand.className, 'flex flex-col min-h-screen')}>
      <Navbar />
      {children}
    </div>
  )
}
