import { Navbar } from '@/components/global/Navbar'
// import { AuthProvider } from '@/hooks/Auth'
import { ThemeProvider } from '@/components/theme-provider'
import { Quicksand } from 'next/font/google'
import './globals.css'
const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <html lang='en'>
      <body className={quicksand.className}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          {/* <AuthProvider> */}
          <Navbar />
          {children}

          {/* </AuthProvider> */}
        </ThemeProvider>
      </body>
    </html>
  )
}
