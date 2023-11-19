'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/Auth'
import { User } from 'lucide-react'
import { ProfileDropdownContentLoggedIn } from './ProfileDropdownContentLoggedIn'
import { ProfileDropdownContentLoggedOut } from './ProfileDropdownContentLoggedOut'
import { getInitials } from './utils'

export const ProfileDropdown = () => {
  const { user } = useAuth()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            {user && (
              <>
                <AvatarImage src={`${user?.user_metadata.avatar_url}`} alt={`${user?.user_metadata.email}`} />
                <AvatarFallback>{getInitials(`${user?.user_metadata.email}`)}</AvatarFallback>
              </>
            )}
            <>
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {user && <ProfileDropdownContentLoggedIn />}
      {!user && <ProfileDropdownContentLoggedOut />}
    </DropdownMenu>
  )
}
