import { DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import Link from 'next/link'

export const ProfileDropdownContentLoggedOut = () => {
  return (
    <DropdownMenuContent className='w-48' align='end' forceMount>
      <DropdownMenuItem>
        <Link href='/auth/sign-up'>Sign Up</Link>
      </DropdownMenuItem>
      <DropdownMenuItem>Log in</DropdownMenuItem>
    </DropdownMenuContent>
  )
}
