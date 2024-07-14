'use client'
import { usePlanner } from '@/hooks/Planner/Planner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PlannerPage() {
  const router = useRouter()
  const { hasLoaded, boardOrder } = usePlanner()

  useEffect(() => {
    if (hasLoaded) {
      const redirectPath = `/boards/${boardOrder.length > 0 ? boardOrder[0] : 'new'}`
      router.push(redirectPath)
    }
  }, [hasLoaded, boardOrder, router])

  return <></>
}
