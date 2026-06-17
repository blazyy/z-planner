'use client'
import { notFound } from 'next/navigation'

import { Board } from '@/components/planner/Board/Board'
import { BoardSkeleton } from '@/components/planner/Board/BoardSkeleton'
import { usePlanner, usePlannerEphemeral } from '@/hooks/Planner/Planner'

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const { boards } = usePlanner()
  const { hasLoaded } = usePlannerEphemeral()
  const { boardId } = params

  if (!hasLoaded) {
    return <BoardSkeleton />
  }

  if (!boards[boardId]) {
    notFound()
  }

  return <Board boardId={boardId} />
}
