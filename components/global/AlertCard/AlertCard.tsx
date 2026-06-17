import { AlertCircle } from 'lucide-react'
import { FallbackProps } from 'react-error-boundary'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const logError = (error: Error, info: { componentStack: string }) => {
  console.error('Unhandled error reached the boundary:', error, info.componentStack)
}

export const AlertCard = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <main className='flex flex-col justify-center items-center gap-8 min-h-screen'>
      <Alert className='w-fit' variant='destructive'>
        <AlertCircle className='w-4 h-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Sorry about that! Something went wrong. </AlertDescription>
      </Alert>
    </main>
  )
}
