'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button variant='outline' size='icon' aria-label='Toggle theme' onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {/* Show a Sun in dark mode (click -> go light) and a Moon in light mode (click -> go dark). */}
      <Sun className='w-[1.2rem] h-[1.2rem] transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100' />
      <Moon className='absolute w-[1.2rem] h-[1.2rem] transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0' />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  )
}
