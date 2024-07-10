import { cn } from '@/lib/utils'
import styles from './LoadingSpinner.module.css'

export const LoadingSpinner = () => {
  return (
    <div className='flex flex-1 justify-center items-center'>
      <div className={cn(styles.loadingSpinner, 'flex min-h-full')} />
    </div>
  )
}
