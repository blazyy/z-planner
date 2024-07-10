import { ThemeProvider } from '@/components/theme-provider'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
          <body>{children}</body>
        </ThemeProvider>
      </html>
    </ClerkProvider>
  )
}
