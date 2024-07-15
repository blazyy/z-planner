'use client'
import { LoadingSpinner } from '@/components/global/LoadingSpinner'
import { ManageBoardsCard } from '@/components/planner/Settings/ManageBoardsCard/ManageBoardsCard'
import { ManageCategoriesCard } from '@/components/planner/Settings/ManageCategoriesCard/ManageCategoriesCard'
import { ManageColumnsCard } from '@/components/planner/Settings/ManageColumnsCard/ManageColumnsCard'
import { Separator } from '@/components/ui/separator'
import { usePlanner } from '@/hooks/Planner/Planner'

export default function SettingsPage() {
  const { hasLoaded } = usePlanner()
  if (!hasLoaded) {
    return <LoadingSpinner />
  }
  return (
    <div className='flex flex-col flex-1 gap-5 mt-3'>
      <h1 className='font-bold text-2xl'>Settings</h1>
      <ManageBoardsCard />
      <Separator />
      <ManageColumnsCard />
      <Separator />
      <ManageCategoriesCard />
    </div>
  )
}
