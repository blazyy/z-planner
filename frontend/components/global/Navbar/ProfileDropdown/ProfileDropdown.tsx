import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from 'lucide-react'
import { ProfileDropdownContentLoggedOut } from './ProfileDropdownContentLoggedOut'

export const ProfileDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            {/* {user && (
              <>
                <AvatarImage src={`${user?.user_metaavatar_url}`} alt={`${user?.user_metaemail}`} />
                <AvatarFallback>{getInitials(`${user?.user_metaemail}`)}</AvatarFallback>
              </>
            )} */}
            <>
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {/* {user && <ProfileDropdownContentLoggedIn />} */}
      {/* {!user && <ProfileDropdownContentLoggedOut />} */}
      <ProfileDropdownContentLoggedOut />
    </DropdownMenu>
  )
}
