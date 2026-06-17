import Link from 'next/link'

export default function NotFound() {
  return (
    <main className='flex flex-col justify-center items-center gap-4 min-h-screen'>
      <h1 className='font-semibold text-2xl'>Page not found</h1>
      <p className='text-gray-500 dark:text-gray-400'>The page you are looking for does not exist.</p>
      <Link href='/boards' className='text-blue-500 underline'>
        Back to your boards
      </Link>
    </main>
  )
}
