import Link from 'next/link'

import { Button } from '@/components/ui/button'

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
  // A real link instead of a button calling router.push: middle-click, prefetch,
  // and link semantics for free. Filters live in a provider that remounts with
  // each board page, so navigation still resets them without an explicit dispatch.
  return (
    <Button asChild variant={isCurrentlySelected ? 'default' : 'ghost'}>
      <Link href={pathname} aria-current={isCurrentlySelected ? 'page' : undefined}>
        <div className='flex justify-between gap-2 w-full'>
          <div className='flex'>
            {icon ? icon : <></>}
            <span className='ml-5'>{label}</span>
          </div>
        </div>
      </Link>
    </Button>
  )
}
