'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const NavLinks = () => {
  const pathname = usePathname() // Used to highlight which route the website is currently on
  const internalNavRoutes = ['About', 'Planner']
  return (
    <div className='flex gap-2'>
      {internalNavRoutes.map((routeName) => {
        const routeHref = `/${routeName.toLowerCase()}`
        const isWebsiteOnRoute = pathname === routeHref
        return (
          <Button
            key={routeName}
            size='sm'
            className={`rounded-full ${isWebsiteOnRoute ? 'bg-slate-100' : ''}`}
            asChild
            variant='ghost'
          >
            <Link href={routeHref}>{routeName}</Link>
          </Button>
        )
      })}
    </div>
  )
}
