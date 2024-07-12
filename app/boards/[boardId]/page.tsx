'use client'
import { LoadingSpinner } from '@/components/global/LoadingSpinner'
import { Board } from '@/components/planner/Board/Board'
import { usePlanner } from '@/hooks/Planner/Planner'

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const { hasLoaded } = usePlanner()
  const { boardId } = params

  if (!hasLoaded) {
    return <LoadingSpinner />
  }
  return <Board boardId={boardId} />
}
