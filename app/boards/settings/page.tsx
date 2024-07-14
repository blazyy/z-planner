'use client'
import { LoadingSpinner } from '@/components/global/LoadingSpinner'
import { ManageBoardsCard } from '@/components/planner/Settings/ManageBoardsCard/ManageBoardsCard'
import { ManageCategoriesCard } from '@/components/planner/Settings/ManageCategoriesCard/ManageCategoriesCard'
import { ManageColumnsCard } from '@/components/planner/Settings/ManageColumnsCard/ManageColumnsCard'
import { usePlanner } from '@/hooks/Planner/Planner'

export default function SettingsPage() {
  const { hasLoaded } = usePlanner()
  if (!hasLoaded) {
    return <LoadingSpinner />
  }
  return (
    <div className='flex flex-col flex-1 gap-5 mt-3 w-full'>
      <h1 className='font-bold text-2xl'>Settings</h1>
      <div className='flex gap-5 w-full'>
        <ManageBoardsCard />
        <ManageColumnsCard />
        <ManageCategoriesCard />
      </div>
    </div>
  )
}
