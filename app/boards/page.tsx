'use client'
import { usePlanner } from '@/hooks/Planner/Planner'
import { useRouter } from 'next/navigation'

export default function PlannerPage() {
  const router = useRouter()
  const plannerContext = usePlanner()
  return router.push('/boards/new')
  const redirectPath = `/boards/${plannerContext.boardOrder.length > 0 ? plannerContext.boardOrder[0] : 'new'}`
  return router.push(redirectPath)
}
