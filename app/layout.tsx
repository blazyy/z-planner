import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <html lang='en' className='dark'>
      <body suppressHydrationWarning>
        <ThemeProvider attribute='class' disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
