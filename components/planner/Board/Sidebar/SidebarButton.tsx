import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export const SidebarButton = ({
  isCurrentlySelected,
  label,
  pathname,
  icon,
}: {
  isCurrentlySelected: boolean
  label: string
  pathname: string
  icon?: React.ReactNode
}) => {
  const router = useRouter()
  return (
    <Button
      variant={isCurrentlySelected ? 'default' : 'ghost'}
      onClick={() => {
        // Filters live in a provider that remounts with each board page, so
        // navigation resets them without an explicit dispatch. The old dispatch
        // here landed in a default context value and silently no-opped anyway.
        router.push(pathname)
      }}
    >
      <div className='flex justify-between gap-2 w-full'>
        <div className='flex'>
          {icon ? icon : <></>}
          <span className='ml-5'>{label}</span>
        </div>
      </div>
    </Button>
  )
}
