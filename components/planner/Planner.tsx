'use client'

import { Provider } from 'react-redux'
import { store } from '@/app/store/store'

import { TaskColumns } from './TaskColumns/TaskColumns'

export default function () {
  return (
    <main className='flex min-h-screen flex-col items-center gap-8'>
      <h1 className='text-8xl font-semibold'>Planner</h1>
      <Provider store={store}>
        <TaskColumns />
      </Provider>
    </main>
  )
}
