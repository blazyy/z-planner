import { NavLinks } from './NavLinks'
import { ProfileDropdown } from './ProfileDropdown/ProfileDropdown'
import { SiteLogo } from './SiteLogo'

export function Navbar() {
  return (
    <div className='flex justify-between'>
      <SiteLogo />
      <div className='flex gap-4'>
        <NavLinks />
        <ProfileDropdown />
      </div>
    </div>
  )
}
