import { ManageCategoriesCard } from '../Sidebar/ManageCategoriesCard/ManageCategoriesCard'
import { ManageBoardsCard } from './ManageBoardsDialog/ManageBoardsCard'

export const SettingsView = () => {
  return (
    <div className='flex flex-col flex-1 gap-5 w-full'>
      <h1 className='font-bold text-2xl'>Settings</h1>
      <div className='flex gap-5 w-full'>
        <ManageBoardsCard />
        <ManageCategoriesCard />
      </div>
    </div>
  )
}
