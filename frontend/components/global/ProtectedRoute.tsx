// import { useAuth } from '@/hooks/Auth'

export const ProtectedRoute = ({ children }: any) => {
  // const { user } = useAuth()
  // if (!user) {
  //   return redirect('/login')
  // }
  return <>{children}</>
}
