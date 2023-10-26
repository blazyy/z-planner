import { useAppSelector } from '@/app/store/hooks'
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut } from '@/components/ui/dropdown-menu'

export const ProfileDropdownContentLoggedOut = () => {
  const { supabase } = useAppSelector((state) => state.database)!
  return (
    <DropdownMenuContent className='w-56' align='end' forceMount>
      <DropdownMenuItem
        onClick={async () => {
          const { data, error } = await supabase!.auth.signInWithOAuth({
            provider: 'github',
          })
        }}
      >
        Log in
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
