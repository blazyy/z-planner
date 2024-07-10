import { Button } from '@/components/ui/button'
import { usePlanner, usePlannerDispatch } from '@/hooks/Planner/Planner'
import { Settings } from 'lucide-react'

export const SettingsModeToggle = () => {
  const { currentView } = usePlanner()
  const dispatch = usePlannerDispatch()
  return (
    <Button
      className='justify-start w-full'
      variant={currentView === 'settings' ? 'secondary' : 'ghost'}
      onClick={() => dispatch({ type: 'settingsModeToggled' })}
    >
      <div className='flex items-center gap-2'>
        <Settings className='w-5 h-5' />
        Settings
      </div>
    </Button>
  )
}
