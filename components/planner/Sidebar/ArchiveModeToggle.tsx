import { Button } from '@/components/ui/button'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { Archive } from 'lucide-react'

export const ArchiveModeToggle = () => {
  const { currentView } = usePlanner()
  const dispatch = usePlannerDispatch()
  return (
    <Button
      className='justify-start w-full'
      variant={currentView === 'archive' ? 'secondary' : 'ghost'}
      onClick={() => dispatch({ type: 'archiveModeToggled' })}
    >
      <div className='flex items-center gap-2'>
        <Archive className='w-5 h-5' />
        Archive
      </div>
    </Button>
  )
}
