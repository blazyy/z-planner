'use client'
import { notFound } from 'next/navigation'

import { Board } from '@/components/planner/Board/Board'
import { BoardSkeleton } from '@/components/planner/Board/BoardSkeleton'
import { useEnsureBoardLoaded, usePlannerEphemeral, usePlannerSelector } from '@/hooks/Planner/Planner'

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const { boardId } = params
  // Boolean existence is a primitive, so this page re-renders only when the
  // board appears/disappears, not on any unrelated data change. After the
  // summary loads, every board's metadata is present, so this is the source of
  // truth for "does this board exist for this user".
  const boardExists = usePlannerSelector((s) => Boolean(s.boards[boardId]))
  const { hasLoaded } = usePlannerEphemeral()
  // Triggers the lazy fetch of this board's heavy slice (columns/cards/subtasks)
  // and reports whether it's loaded yet. Called unconditionally (hooks rule);
  // the fetch only runs once boardExists gates rendering past notFound below.
  const isBoardLoaded = useEnsureBoardLoaded(boardId)

  // Until the light summary resolves we don't yet know which boards exist.
  if (!hasLoaded) {
    return <BoardSkeleton />
  }

  if (!boardExists) {
    notFound()
  }

  // Summary says the board exists, but its columns/cards haven't arrived yet:
  // keep the skeleton up (same observable "skeleton then board" as before).
  if (!isBoardLoaded) {
    return <BoardSkeleton />
  }

  return <Board boardId={boardId} />
}
