import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { ProfileDropdownContentLoggedIn } from './ProfileDropdownContentLoggedIn'
import { ProfileDropdownContentLoggedOut } from './ProfileDropdownContentLoggedOut'
import { getInitials } from './utils'

export const ProfileDropdown = () => {
  const [loggedInUser, setLoggedInUser] = useState<null>(null)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            {loggedInUser && (
              <>
                {/* <AvatarImage src={`${loggedInUser.user_metadata.avatar_url}`} alt={`${loggedInUser.email}`} />
                <AvatarFallback>{getInitials(`${loggedInUser.email}`)}</AvatarFallback> */}
              </>
            )}
            {!loggedInUser && (
              <AvatarFallback>
                <UserIcon />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {loggedInUser && <ProfileDropdownContentLoggedIn />}
      {!loggedInUser && <ProfileDropdownContentLoggedOut />}
    </DropdownMenu>
  )
}
