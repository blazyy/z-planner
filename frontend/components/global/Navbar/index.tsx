import { NavLinks } from './NavLinks'
import { ProfileDropdown } from './ProfileDropdown/ProfileDropdown'
import { SiteLogo } from './SiteLogo'

export function Navbar() {
  return (
    // 98% because of 1% padding (x2) on body (globals.css)
    <div className='fixed flex justify-between border-zinc-100 px-3 pt-3 pb-2 border-b-2 min-w-[98%]'>
      <SiteLogo />
      <div className='flex gap-4'>
        <NavLinks />
        <ProfileDropdown />
      </div>
    </div>
  )
}
