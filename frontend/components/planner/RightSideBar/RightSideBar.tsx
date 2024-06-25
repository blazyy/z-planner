import { Home, LineChart, Package, Package2, Settings, ShoppingCart, Users2 } from 'lucide-react'
import Link from 'next/link'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const RightSideBar = () => {
  return (
    <aside className='right-0 z-10 fixed inset-y-0 sm:flex flex-col hidden bg-background border-r w-14'>
      <TooltipProvider delayDuration={0}>
        <nav className='flex flex-col items-center gap-4 px-2 sm:py-5'>
          <Link
            href='#'
            className='flex justify-center items-center gap-2 bg-primary rounded-full w-9 md:w-8 h-9 md:h-8 font-semibold text-lg text-primary-foreground md:text-base group shrink-0'
          >
            <Package2 className='group-hover:scale-110 w-4 h-4 transition-all' />
            <span className='sr-only'>Acme Inc</span>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href='#'
                className='flex justify-center items-center rounded-lg w-9 md:w-8 h-9 md:h-8 text-muted-foreground hover:text-foreground transition-colors'
              >
                <Home className='w-5 h-5' />
                <span className='sr-only'>Dashboard</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side='right'>Dashboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href='#'
                className='flex justify-center items-center bg-accent rounded-lg w-9 md:w-8 h-9 md:h-8 text-accent-foreground hover:text-foreground transition-colors'
              >
                <ShoppingCart className='w-5 h-5' />
                <span className='sr-only'>Orders</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side='right'>Orders</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href='#'
                className='flex justify-center items-center rounded-lg w-9 md:w-8 h-9 md:h-8 text-muted-foreground hover:text-foreground transition-colors'
              >
                <Package className='w-5 h-5' />
                <span className='sr-only'>Products</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side='right'>Products</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href='#'
                className='flex justify-center items-center rounded-lg w-9 md:w-8 h-9 md:h-8 text-muted-foreground hover:text-foreground transition-colors'
              >
                <Users2 className='w-5 h-5' />
                <span className='sr-only'>Customers</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side='right'>Customers</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href='#'
                className='flex justify-center items-center rounded-lg w-9 md:w-8 h-9 md:h-8 text-muted-foreground hover:text-foreground transition-colors'
              >
                <LineChart className='w-5 h-5' />
                <span className='sr-only'>Analytics</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side='right'>Analytics</TooltipContent>
          </Tooltip>
        </nav>
        <nav className='flex flex-col items-center gap-4 mt-auto px-2 sm:py-5'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href='#'
                className='flex justify-center items-center rounded-lg w-9 md:w-8 h-9 md:h-8 text-muted-foreground hover:text-foreground transition-colors'
              >
                <Settings className='w-5 h-5' />
                <span className='sr-only'>Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side='right'>Settings</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  )
}
