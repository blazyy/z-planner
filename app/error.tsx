'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled route error:', error)
  }, [error])

  return (
    <main className='flex flex-col justify-center items-center gap-4 min-h-screen'>
      <h1 className='font-semibold text-2xl'>Something went wrong</h1>
      <p className='text-gray-500'>Sorry about that. You can try again.</p>
      <button onClick={reset} className='text-blue-500 underline'>
        Try again
      </button>
    </main>
  )
}
