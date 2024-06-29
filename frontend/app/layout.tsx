import { ThemeProvider } from '@/components/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'
import { Quicksand } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'

export const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const calsans = localFont({
  src: '../assets/fonts/CalSans-SemiBold.woff2',
})

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <body>{children}</body>
        </ThemeProvider>
      </html>
    </ClerkProvider>
  )
}
