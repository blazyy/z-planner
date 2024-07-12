'use client'
import { usePlanner } from '@/hooks/Planner/Planner'
import { useRouter } from 'next/navigation'

export default function PlannerPage() {
  const router = useRouter()
  const plannerContext = usePlanner()

  if (plannerContext.boardOrder.length > 0) {
    router.push(`/boards/${plannerContext.boardOrder[0]}`)
  }

  return <></>
}
