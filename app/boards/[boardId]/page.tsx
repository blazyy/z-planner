'use client'
import { LoadingSpinner } from '@/components/global/LoadingSpinner'
import { Board } from '@/components/planner/Board/Board'
import { usePlanner } from '@/hooks/Planner/Planner'

export default function BoardPage({ params }: { params: { boardId: string } }) {
  const { hasLoaded } = usePlanner()
  const { boardId } = params

  if (!hasLoaded) {
    return (
      <div className='flex flex-col justify-center items-center gap-2 w-full'>
        <LoadingSpinner />
      </div>
    )
  }
  return <Board boardId={boardId} />
}
