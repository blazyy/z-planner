import { LoadingSpinner } from '@/components/global/LoadingSpinner'

export default function Loading() {
  return (
    <div className='flex flex-1 justify-center items-center w-full'>
      <LoadingSpinner />
    </div>
  )
}
