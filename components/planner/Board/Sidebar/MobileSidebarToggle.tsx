'use client'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'

type MobileSidebarToggleProps = {
  isOpen: boolean
  onClick: () => void
  controlsId: string
}

// Hamburger button shown only below lg (hidden lg:inline-flex). Toggles the
// mobile board-navigation drawer. aria-expanded/aria-controls tie it to the
// drawer for screen-reader users; the ghost variant carries the shared
// focus-visible ring so it is keyboard-discoverable.
export const MobileSidebarToggle = ({ isOpen, onClick, controlsId }: MobileSidebarToggleProps) => {
  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className='lg:hidden'
      aria-label='Toggle board navigation'
      aria-expanded={isOpen}
      aria-controls={controlsId}
      onClick={onClick}
    >
      <Menu className='w-5 h-5' />
    </Button>
  )
}
