import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export const NewsAlertBanner = () => {
  return (
    <Alert className='border-2 border-blue-400 border-dashed w-128'>
      <AlertCircle className='w-4 h-4' />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        This website is still in development. Please share any feedback you have. Do not expect anything to work or your
        data to be saved.
      </AlertDescription>
    </Alert>
  )
}
