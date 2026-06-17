import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import { ReactNode } from 'react'
import './globals.css'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: {
    default: 'z-planner',
    template: '%s · z-planner',
  },
  description: 'A Kanban-style planner. Boards, columns, drag-and-drop cards, subtasks, and categories.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' className={quicksand.className} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
