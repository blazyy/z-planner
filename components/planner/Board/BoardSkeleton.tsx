import { Skeleton } from '@/components/ui/skeleton'

// Mirrors the real board layout (columns of ~w-96 with a header card and a stack
// of task cards) so the load transition doesn't shift content. Purely presentational;
// shown only while planner data is still loading (!hasLoaded).
const SKELETON_COLUMNS = 3
const SKELETON_CARDS_PER_COLUMN = [4, 3, 5]

const TaskCardSkeleton = () => (
  <div className='flex flex-col gap-2 bg-card shadow-sm mb-2 p-3 rounded-lg'>
    <Skeleton className='w-3/4 h-4' />
    <Skeleton className='w-1/3 h-3' />
    <Skeleton className='mt-1 w-full h-2' />
  </div>
)

const ColumnSkeleton = ({ cardCount }: { cardCount: number }) => (
  <div className='flex flex-col gap-1 mr-2 w-96'>
    <div className='bg-card shadow-sm mb-1 p-2 rounded-lg'>
      <div className='flex flex-row justify-between items-center px-2'>
        <Skeleton className='w-32 h-6' />
        <Skeleton className='rounded-full w-5 h-5' />
      </div>
    </div>
    <div
      className='flex flex-col bg-neutral-100 dark:bg-neutral-800 p-1 px-2 rounded-lg grow'
      style={{ minHeight: '82vh', maxHeight: '82vh' }}
    >
      {Array.from({ length: cardCount }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </div>
  </div>
)

export const BoardSkeleton = () => {
  return (
    <div className='flex flex-col gap-2 w-5/6' aria-busy='true' aria-label='Loading board'>
      {/* Filter toolbar placeholder */}
      <div className='flex justify-start items-center gap-2 w-full'>
        <Skeleton className='w-64 h-10' />
        <Skeleton className='w-40 h-10' />
        <Skeleton className='w-24 h-10' />
        <Skeleton className='ml-auto w-44 h-10' />
      </div>
      {/* Columns placeholder */}
      <div className='flex flex-row' style={{ minHeight: '87vh', maxHeight: '87vh' }}>
        {Array.from({ length: SKELETON_COLUMNS }).map((_, index) => (
          <ColumnSkeleton key={index} cardCount={SKELETON_CARDS_PER_COLUMN[index] ?? 4} />
        ))}
      </div>
    </div>
  )
}
