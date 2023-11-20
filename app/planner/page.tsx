'use client'
import { Planner } from '@/components/planner/Planner'
import { PlannerProvider } from '@/hooks/Planner/Planner'

export default function PlannerPage() {
  return (
    <PlannerProvider>
      <Planner />
    </PlannerProvider>
  )
}
