import { SignedIn, UserButton } from '@clerk/nextjs'
import { SiteLogo } from './SiteLogo'

export function Navbar() {
  return (
    // 98% because of 1% padding (x2) on body (globals.css)
    <div className='top-0 sticky flex justify-between items-center border-zinc-100 bg-white px-3 pt-3 pb-2 border-b-2 min-w-[98%]'>
      <SiteLogo />
      {/* <NewsAlertBanner /> */}
      <div className='flex gap-2'>
        {/* <NavLinks /> */}
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  )
}
