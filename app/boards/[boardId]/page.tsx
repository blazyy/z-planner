'use client'
import { Board } from '@/components/planner/Board/Board'
import { usePlanner } from '@/hooks/Planner/Planner'

interface BoardPageProps {
  params: {
    boardId: string
  }
}

export default function BoardPage({ params }: BoardPageProps) {
  const { hasLoaded } = usePlanner()
  const { boardId } = params

  if (!hasLoaded) {
    return <></>
  }
  return <Board boardId={boardId} />
}
