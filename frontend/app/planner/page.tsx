'use client'
import { AlertCard, logError } from '@/components/global/AlertCard/AlertCard'
import { Planner } from '@/components/planner/Planner'
import { SignInCallout } from '@/components/planner/SignInCallout'
import { PlannerProvider } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const queryClient = new QueryClient()

export default function PlannerPage() {
  const { userId } = useAuth()

  if (!userId) {
    return <SignInCallout />
  }

  return (
    <ErrorBoundary FallbackComponent={AlertCard} onError={logError}>
      <QueryClientProvider client={queryClient}>
        <PlannerProvider>
          <Planner />
        </PlannerProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
