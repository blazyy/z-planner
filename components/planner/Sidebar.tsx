'use client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { usePlanner } from '@/hooks/Planner/Planner'
import { usePlannerFiltersDispatch } from '@/hooks/PlannerFilters/PlannerFilters'
import { Archive, Github, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

const SidebarButton = ({
  isCurrentlySelected,
  label,
  pathname,
  icon,
}: {
  isCurrentlySelected: boolean
  label: string
  pathname: string
  icon?: React.ReactNode
}) => {
  const router = useRouter()
  const filtersDispatch = usePlannerFiltersDispatch()
  return (
    <Button
      variant={isCurrentlySelected ? 'secondary' : 'ghost'}
      className={`${isCurrentlySelected ? 'border-l-4 border-green-500' : ''}`}
      onClick={() => {
        router.push(pathname)
        filtersDispatch({ type: 'filtersReset' })
      }}
    >
      <div className='flex justify-between gap-2 w-full'>
        <div className='flex'>
          {icon ? icon : <></>}
          <span className='ml-2'>{label}</span>
        </div>
      </div>
    </Button>
  )
}

export const Sidebar = ({ currentPage }: { currentPage: string }) => {
  const { boardOrder, boards, hasLoaded } = usePlanner()
  if (!hasLoaded || boardOrder.length === 0) {
    return <></>
  }
  return (
    <nav className='flex flex-col items-start gap-8 w-1/6'>
      <div className='flex flex-col justify-between gap-2 w-full h-full'>
        <div>
          <div className='flex flex-col gap-2 w-full'>
            {boardOrder.map((boardId, i) => (
              <SidebarButton
                key={i}
                isCurrentlySelected={boardId === currentPage}
                label={boards[boardId].name}
                pathname={`/boards/${boardId}`}
              />
            ))}
          </div>
          <div className='flex flex-col gap-2 mt-5 w-full'>
            <Separator />
            <SidebarButton
              isCurrentlySelected={currentPage === 'archive'}
              label='Archive'
              pathname='/boards/archive'
              icon={<Archive className='w-5 h-5' />}
            />
            <SidebarButton
              isCurrentlySelected={currentPage === 'settings'}
              label='Settings'
              pathname='/boards/settings'
              icon={<Settings className='w-5 h-5' />}
            />
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
