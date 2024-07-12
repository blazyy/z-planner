'use client'
import { AlertCard, logError } from '@/components/global/AlertCard/AlertCard'
import { Navbar } from '@/components/global/Navbar'
import { Sidebar } from '@/components/planner/Sidebar/Sidebar'
import { PlannerProvider } from '@/hooks/Planner/Planner'
import { cn } from '@/lib/utils'
import { Quicksand } from 'next/font/google'
import { useParams } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export default function Layout({ children }: { children: JSX.Element }) {
  const { boardId } = useParams<{ boardId: string }>()

  return (
    <div className={cn(quicksand.className, 'flex flex-col min-h-screen')}>
      <Navbar />
      <main id='planner' className='flex flex-col flex-1 justify-start items-center p-5 w-full'>
        <ErrorBoundary FallbackComponent={AlertCard} onError={logError}>
          <PlannerProvider>
            <div className='flex flex-1 justify-start gap-2 w-full'>
              <Sidebar selectedBoardId={boardId} />
              {children}
            </div>
          </PlannerProvider>
        </ErrorBoundary>
      </main>
    </div>
  )
}
