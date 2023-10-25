'use client'
import { Navbar } from '@/components/global/Navbar'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { Provider } from 'react-redux'
import './globals.css'
import { store } from './store/store'

// import type { Metadata } from 'next'
// export const metadata: Metadata = {
//   title: 'Faaez Razeen Nizamudeen',
//   description: 'The digital realm of Faaez Razeen Nizamudeen',
// }

export default function RootLayout({ children, session }: { children: React.ReactNode; session: Session }) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <html lang='en'>
          <body>
            <Navbar />
            {children}
          </body>
        </html>
      </Provider>
    </SessionProvider>
  )
}
