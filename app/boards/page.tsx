'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { LoadingSpinner } from '@/components/global/LoadingSpinner'
import { usePlanner, usePlannerEphemeral } from '@/hooks/Planner/Planner'

export default function PlannerPage() {
  const router = useRouter()
  const { boardOrder } = usePlanner()
  const { hasLoaded } = usePlannerEphemeral()

  useEffect(() => {
    if (hasLoaded) {
      const redirectPath = `/boards/${boardOrder.length > 0 ? boardOrder[0] : 'new'}`
      router.replace(redirectPath)
    }
  }, [hasLoaded, boardOrder, router])

  return <LoadingSpinner />
}
