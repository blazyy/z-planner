import { useAuth } from '@/hooks/Auth'
import { redirect } from 'next/navigation'

export const ProtectedRoute = ({ children }: any) => {
  const { user } = useAuth()
  if (!user) {
    return redirect('/login')
  }
  return <>{children}</>
}
