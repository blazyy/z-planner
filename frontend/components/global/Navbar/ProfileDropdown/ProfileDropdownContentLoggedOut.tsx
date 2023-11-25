import { DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut } from '@/components/ui/dropdown-menu'

export const ProfileDropdownContentLoggedOut = () => {
  return (
    <DropdownMenuContent className='w-56' align='end' forceMount>
      <DropdownMenuItem>
        Log in
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
