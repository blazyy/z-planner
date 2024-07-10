'use client'
import { AlertCard, logError } from '@/components/global/AlertCard/AlertCard'
import { Planner } from '@/components/planner/Planner'
import { SignInCallout } from '@/components/planner/SignInCallout'
import { PlannerProvider } from '@/hooks/Planner/Planner'
import { useAuth } from '@clerk/nextjs'
import { ErrorBoundary } from 'react-error-boundary'

export default function PlannerPage() {
  const { userId } = useAuth()

  if (!userId) {
    return <SignInCallout />
  }

  return (
    <ErrorBoundary FallbackComponent={AlertCard} onError={logError}>
      <PlannerProvider>
        <Planner />
      </PlannerProvider>
    </ErrorBoundary>
  )
}
