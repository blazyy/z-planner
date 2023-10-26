import { useAppSelector } from '@/app/store/hooks'
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { User } from '@supabase/supabase-js'
import { signOut } from 'next-auth/react'

type ProfileDropdownContentLoggedInProps = {
  loggedInUser: User
}

export const ProfileDropdownContentLoggedIn = ({ loggedInUser }: ProfileDropdownContentLoggedInProps) => {
  const { supabase } = useAppSelector((state) => state.database)!
  return (
    <DropdownMenuContent className='w-56' align='end' forceMount>
      <DropdownMenuLabel className='font-normal'>
        <div className='flex flex-col space-y-1'>
          <p className='text-sm font-medium leading-none'>
            {loggedInUser?.identities && loggedInUser?.identities[0].identity_data?.preferred_username}
          </p>
          <p className='text-xs leading-none text-muted-foreground'>{loggedInUser.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Settings
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={async () => {
          const { error } = await supabase!.auth.signOut()
        }}
      >
        Log out
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
