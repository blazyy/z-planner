'use client'
import { ClerkProvider } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { AlertCard, logError } from '@/components/global/AlertCard/AlertCard'
import { Navbar } from '@/components/global/Navbar'
import { MobileSidebar } from '@/components/planner/Board/Sidebar/MobileSidebar'
import { MobileSidebarToggle } from '@/components/planner/Board/Sidebar/MobileSidebarToggle'
import { Sidebar } from '@/components/planner/Board/Sidebar/Sidebar'
import { Toaster } from '@/components/ui/sonner'
import { PlannerProvider } from '@/hooks/Planner/Planner'

const MOBILE_SIDEBAR_ID = 'mobile-board-sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const currentPage = pathname.split('/boards/')[1]
  // Open/close state for the mobile (<lg) sidebar drawer. Lives here so both the
  // navbar toggle and the drawer share it; desktop never reads it (inline Sidebar
  // is always visible at lg, drawer + toggle are hidden via lg:hidden).
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <ClerkProvider afterSignOutUrl='/'>
      <div className='flex flex-col min-h-screen'>
        <Navbar
          sidebarToggle={
            <MobileSidebarToggle
              isOpen={isSidebarOpen}
              onClick={() => setIsSidebarOpen((open) => !open)}
              controlsId={MOBILE_SIDEBAR_ID}
            />
          }
        />
        <main id='planner' className='flex flex-col flex-1 justify-start items-center p-2 w-full overflow-hidden'>
          <ErrorBoundary FallbackComponent={AlertCard} onError={logError}>
            <PlannerProvider>
              <MobileSidebar
                id={MOBILE_SIDEBAR_ID}
                isOpen={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
                currentPage={currentPage}
              />
              <div className='flex flex-1 justify-start gap-2 w-full'>
                {/* Inline sidebar: desktop only. Hidden below lg, where the drawer above takes over.
                    lg:flex (not block) so the <nav> stretches to the row height exactly as before. */}
                <div className='hidden lg:flex'>
                  <Sidebar currentPage={currentPage} />
                </div>
                <Toaster richColors />
                {children}
              </div>
            </PlannerProvider>
          </ErrorBoundary>
        </main>
      </div>
    </ClerkProvider>
  )
}
