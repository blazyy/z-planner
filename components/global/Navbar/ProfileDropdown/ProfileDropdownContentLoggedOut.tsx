import { DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut } from '@/components/ui/dropdown-menu'
import { signIn } from 'next-auth/react'

export const ProfileDropdownContentLoggedOut = () => {
  return (
    <DropdownMenuContent className='w-56' align='end' forceMount>
      <DropdownMenuItem onClick={() => signIn()}>
        Log in
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
