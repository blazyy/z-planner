import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { LogIn, LogOut, User } from 'lucide-react'
import { getInitials } from './utils'

export const ProfileDropdown = async () => {
  const user = await currentUser()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative rounded-full w-10 h-10'>
          <Avatar className='justify-center items-center w-10 h-10'>
            <SignedOut>
              <User />
            </SignedOut>
            <SignedIn>
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{getInitials(`${user?.fullName}`)}</AvatarFallback>
            </SignedIn>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='mr-5'>
        <SignedIn>
          <DropdownMenuLabel>{user?.fullName}</DropdownMenuLabel>
          <DropdownMenuItem>
            <LogOut className='mr-2 w-4 h-4' />
            <SignOutButton />
          </DropdownMenuItem>
        </SignedIn>
        <SignedOut>
          <DropdownMenuItem>
            <LogIn className='mr-2 w-4 h-4' />
            <SignInButton />
          </DropdownMenuItem>
        </SignedOut>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
