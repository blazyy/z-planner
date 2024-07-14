import { Quicksand } from 'next/font/google'
import './globals.css'

const quicksand = Quicksand({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <html lang='en' className={quicksand.className}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
