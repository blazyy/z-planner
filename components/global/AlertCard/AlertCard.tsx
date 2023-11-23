import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { FallbackProps } from 'react-error-boundary'

export const logError = (error: Error, info: { componentStack: string }) => {
  console.error(error, info)
}

export const AlertCard = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <main className='flex min-h-screen flex-col justify-center items-center gap-8'>
      <Alert className='w-fit' variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Sorry about that! Something went wrong.</AlertDescription>
        {/* <Button onClick={resetErrorBoundary}>Reload</Button> */}
      </Alert>
    </main>
  )
}
