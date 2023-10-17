import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { ProfileDropdownContentLoggedIn } from './ProfileDropdownContentLoggedIn'
import { ProfileDropdownContentLoggedOut } from './ProfileDropdownContentLoggedOut'
import { getInitials } from './utils'

export const ProfileDropdown = () => {
  const { data: session } = useSession()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            {session && (
              <>
                <AvatarImage src={`${session?.user?.image}`} alt={`${session?.user?.email}`} />
                <AvatarFallback>{getInitials(`${session?.user?.name}`)}</AvatarFallback>
              </>
            )}
            {!session && (
              <>
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {session && <ProfileDropdownContentLoggedIn />}
      {!session && <ProfileDropdownContentLoggedOut />}
    </DropdownMenu>
  )
}
