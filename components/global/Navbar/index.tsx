import { SignedIn, UserButton } from '@clerk/nextjs'

import { ModeToggle } from '@/components/global/ModeToggle'

import { SiteLogo } from './SiteLogo'

export function Navbar() {
  return (
    // 98% because of 1% padding (x2) on body (globals.css)
    <div className='top-0 z-40 sticky flex flex-wrap justify-between items-center gap-y-2 border-zinc-100 dark:border-zinc-800 bg-background px-3 pt-3 pb-2 border-b-2 min-w-[98%]'>
      <SiteLogo />
      <div className='flex items-center gap-2'>
        <ModeToggle />
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  )
}
