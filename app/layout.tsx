import type { Metadata } from 'next'

import './globals.css'

import { Navbar } from '@/components/global/Navbar'

export const metadata: Metadata = {
  title: 'Faaez Razeen Nizamudeen',
  description: 'The digital realm of Faaez Razeen Nizamudeen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
