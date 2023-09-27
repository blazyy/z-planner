import { SiteLogo } from './SiteLogo'
import { NavLinks } from './NavLinks'

export function Navbar() {
  return (
    <div className='flex justify-between'>
      <SiteLogo />
      <NavLinks />
    </div>
  )
}
