'use client'
import { AlertCard, logError } from '@/components/global/AlertCard/AlertCard'
import { Planner } from '@/components/planner/Planner'
import { PlannerProvider } from '@/hooks/Planner/Planner'
import { ErrorBoundary } from 'react-error-boundary'

export default function PlannerPage() {
  return (
    <ErrorBoundary FallbackComponent={AlertCard} onError={logError}>
      <PlannerProvider>
        <Planner />
      </PlannerProvider>
    </ErrorBoundary>
  )
}
