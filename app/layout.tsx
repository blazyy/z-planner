'use client'
import { Navbar } from '@/components/global/Navbar'
import { Provider } from 'react-redux'
import './globals.css'
import { store } from './store/store'

// import type { Metadata } from 'next'
// export const metadata: Metadata = {
//   title: 'Faaez Razeen Nizamudeen',
//   description: 'The digital realm of Faaez Razeen Nizamudeen',
// }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <html lang='en'>
        <body className='flex flex-col'>
          <Navbar />
          {children}
        </body>
      </html>
    </Provider>
  )
}
