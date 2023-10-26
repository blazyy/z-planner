import { useAppSelector } from '@/app/store/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from '@supabase/supabase-js'
import { User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ProfileDropdownContentLoggedIn } from './ProfileDropdownContentLoggedIn'
import { ProfileDropdownContentLoggedOut } from './ProfileDropdownContentLoggedOut'
import { getInitials } from './utils'

export const ProfileDropdown = () => {
  const { supabase } = useAppSelector((state) => state.database)!
  const [loggedInUser, setLoggedInUser] = useState<null | User>(null)

  useEffect(() => {
    async function fetchData() {
      const user = await supabase!.auth.getUser()
      setLoggedInUser(user.data.user)
    }
    fetchData()
  }, [supabase])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            {loggedInUser && (
              <>
                <AvatarImage src={`${loggedInUser.user_metadata.avatar_url}`} alt={`${loggedInUser.email}`} />
                <AvatarFallback>{getInitials(`${loggedInUser.email}`)}</AvatarFallback>
              </>
            )}
            {!loggedInUser && (
              <>
                <AvatarFallback>
                  <UserIcon />
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {loggedInUser && <ProfileDropdownContentLoggedIn loggedInUser={loggedInUser} />}
      {!loggedInUser && <ProfileDropdownContentLoggedOut />}
    </DropdownMenu>
  )
}
