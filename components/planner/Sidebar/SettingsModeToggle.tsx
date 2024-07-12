import { Button } from '@/components/ui/button'
import { usePlanner } from '@/hooks/Planner/Planner'
import { Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const SettingsModeToggle = () => {
  const { currentView } = usePlanner()
  const router = useRouter()

  return (
    <Button
      className='justify-start w-full'
      variant={currentView === 'settings' ? 'secondary' : 'ghost'}
      onClick={() => router.push(`/boards/settings`)}
    >
      <div className='flex items-center gap-2'>
        <Settings className='w-5 h-5' />
        Settings
      </div>
    </Button>
  )
}
