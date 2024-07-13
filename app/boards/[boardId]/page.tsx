'use client'
import { LoadingSpinner } from '@/components/global/LoadingSpinner'
import { Board } from '@/components/planner/Board/Board'
import { usePlanner } from '@/hooks/Planner/Planner'
import { useRouter } from 'next/navigation'

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const { hasLoaded, boards } = usePlanner()
  const { boardId } = params
  const router = useRouter()

  if (!hasLoaded) {
    return <LoadingSpinner />
  }

  if (!boards[boardId]) {
    return router.push('/not-found')
  }

  return <Board boardId={boardId} />
}
