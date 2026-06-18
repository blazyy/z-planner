'use client'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog'

import { Sidebar } from './Sidebar'

type MobileSidebarProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentPage: string
  id: string
}

// Mobile-only (<lg) slide-in drawer that hosts the same Sidebar shown inline on
// desktop. Built on the existing Radix Dialog primitive so we get a focus trap,
// Esc-to-close, and the aria wiring for free; the content is repositioned to the
// left edge and made full-height to read as a drawer rather than a centered modal.
// On lg+ the drawer is never opened (the toggle that controls it is hidden), and
// the inline Sidebar in the layout remains the source of truth, so desktop is
// untouched.
export const MobileSidebar = ({ isOpen, onOpenChange, currentPage, id }: MobileSidebarProps) => {
  const pathname = usePathname()

  // Close the drawer whenever the route changes (e.g. tapping a board link),
  // matching the "close on navigation" requirement.
  useEffect(() => {
    onOpenChange(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='lg:hidden' />
        <DialogPrimitive.Content
          id={id}
          aria-label='Board navigation'
          className='lg:hidden top-0 left-0 z-50 fixed bg-background shadow-lg p-4 border-r-2 border-zinc-100 dark:border-zinc-800 w-72 max-w-[85vw] h-full data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=closed]:animate-out duration-200'
        >
          <DialogPrimitive.Title className='sr-only'>Board navigation</DialogPrimitive.Title>
          <DialogPrimitive.Description className='sr-only'>
            Navigate between your boards and app settings.
          </DialogPrimitive.Description>
          <div className='flex justify-end mb-2'>
            <DialogPrimitive.Close className='inline-flex justify-center items-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background w-10 h-10 transition-colors'>
              <X className='w-5 h-5' />
              <span className='sr-only'>Close navigation</span>
            </DialogPrimitive.Close>
          </div>
          <Sidebar currentPage={currentPage} />
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
