'use client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePlanner } from '@/hooks/Planner/Planner'
import { BoardInfoType } from '@/hooks/Planner/types'
import { usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'
import { Github } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ArchiveModeToggle } from './ArchiveModeToggle'
import { SettingsModeToggle } from './SettingsModeToggle'

type BoardButtonProps = {
  board: BoardInfoType
  isCurrentlySelectedBoard: boolean
}

const BoardButton = ({ board, isCurrentlySelectedBoard }: BoardButtonProps) => {
  const router = useRouter()
  const filtersDispatch = usePlannerFiltersDispatch()
  return (
    <Button
      variant={isCurrentlySelectedBoard ? 'secondary' : 'ghost'}
      className={`${isCurrentlySelectedBoard ? 'border-l-4 border-green-500' : ''}`}
      onClick={() => {
        router.push(`/boards/${board.id}`)
        filtersDispatch({ type: 'filtersReset' })
      }}
    >
      <div className='flex justify-between gap-2 w-full'>
        <div className='flex'>{board.name}</div>
      </div>
    </Button>
  )
}

export const Sidebar = ({ selectedBoardId }: { selectedBoardId: string }) => {
  const { boardOrder, boards } = usePlanner()
  return (
    <nav className='flex flex-col items-start gap-8 w-1/6'>
      <div className='flex flex-col justify-between gap-2 w-full h-full'>
        <div>
          <div className='flex flex-col gap-2 w-full'>
            {boardOrder.map((boardId, i) => (
              <BoardButton key={i} board={boards[boardId]} isCurrentlySelectedBoard={boardId === selectedBoardId} />
            ))}
          </div>
          <div className='flex flex-col gap-2 mt-5 w-full'>
            <Separator />
            <ArchiveModeToggle />
            <SettingsModeToggle />
          </div>
        </div>
        <div>
          <a href='https://github.com/blazyy/z-planner' target='_blank' rel='noopener noreferrer'>
            <Button variant='ghost' className='justify-start mb-2 w-full'>
              <div className='flex items-center gap-2'>
                <Github className='mr-2 w-5 h-5' /> GitHub
              </div>
            </Button>
          </a>
        </div>
      </div>
    </nav>
  )
}
