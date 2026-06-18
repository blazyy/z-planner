'use client'
import { notFound } from 'next/navigation'

import { Board } from '@/components/planner/Board/Board'
import { BoardSkeleton } from '@/components/planner/Board/BoardSkeleton'
import { usePlannerEphemeral, usePlannerSelector } from '@/hooks/Planner/Planner'

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const { boardId } = params
  // Boolean existence is a primitive, so this page re-renders only when the
  // board appears/disappears, not on any unrelated data change.
  const boardExists = usePlannerSelector((s) => Boolean(s.boards[boardId]))
  const { hasLoaded } = usePlannerEphemeral()

  if (!hasLoaded) {
    return <BoardSkeleton />
  }

  if (!boardExists) {
    notFound()
  }

  return <Board boardId={boardId} />
}
