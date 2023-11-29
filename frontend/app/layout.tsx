import { Navbar } from '@/components/global/Navbar'
// import { AuthProvider } from '@/hooks/Auth'
import { Quicksand } from 'next/font/google'
import './globals.css'
const inter = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        {/* <AuthProvider> */}
        <Navbar />
        {children}
        {/* </AuthProvider> */}
      </body>
    </html>
  )
}
