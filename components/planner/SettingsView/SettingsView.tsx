import { ManageBoardsCard } from './ManageBoardsCard/ManageBoardsCard'
import { ManageCategoriesCard } from './ManageCategoriesCard/ManageCategoriesCard'
import { ManageColumnsCard } from './ManageColumnsCard/ManageColumnsCard'

export const SettingsView = () => {
  return (
    <div className='flex flex-col flex-1 gap-5 w-full'>
      <h1 className='font-bold text-2xl'>Settings</h1>
      <div className='flex gap-5 w-full'>
        <ManageBoardsCard />
        <ManageColumnsCard />
        <ManageCategoriesCard />
      </div>
    </div>
  )
}
