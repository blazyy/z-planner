'use client'
import { Button } from '@/components/ui/button'
import { usePlanner } from '@/hooks/Planner/Planner'
import { ExternalLink, Github, Settings } from 'lucide-react'
import { SidebarButton } from './SidebarButton'

export const Sidebar = ({ currentPage }: { currentPage: string }) => {
  const { boardOrder, boards, hasLoaded } = usePlanner()
  if (!hasLoaded || boardOrder.length === 0) {
    return <></>
  }
  return (
    <nav className='flex flex-col items-start gap-8 w-64'>
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
          {/* <div className='flex flex-col gap-2 mt-5 w-full'> */}
          {/* <Separator /> */}
          {/* <SidebarButton
              isCurrentlySelected={currentPage === 'archive'}
              label='Archive'
              pathname='/boards/archive'
              icon={<Archive className='w-5 h-5' />}
            /> */}
          {/* </div> */}
        </div>
        <div className='flex flex-col gap-2 mt-5 w-full'>
          <SidebarButton
            isCurrentlySelected={currentPage === 'settings'}
            label='Settings'
            pathname='/boards/settings'
            icon={<Settings className='w-5 h-5' />}
          />
          <div>
            <a href='https://github.com/blazyy/z-planner' target='_blank' rel='noopener noreferrer'>
              <Button variant='ghost' className='justify-start mb-2 w-full'>
                <div className='flex justify-between gap-2 w-full'>
                  <div className='flex'>
                    <Github className='w-5 h-5' />
                    <span className='ml-5'>GitHub</span>
                  </div>
                  <ExternalLink className='w-5 h-5 text-neutral-400' />
                </div>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
