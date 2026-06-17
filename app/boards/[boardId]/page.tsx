'use client'
import { notFound } from 'next/navigation'

import { LoadingSpinner } from '@/components/global/LoadingSpinner'
import { Board } from '@/components/planner/Board/Board'
import { usePlanner } from '@/hooks/Planner/Planner'

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const { hasLoaded, boards } = usePlanner()
  const { boardId } = params

  if (!hasLoaded) {
    return <LoadingSpinner />
  }

  if (!boards[boardId]) {
    notFound()
  }

  return <Board boardId={boardId} />
}
