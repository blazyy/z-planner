'use client'
import { PlannerProvider } from '@/hooks/Planner/Planner'
import { ProtectedRoute } from '../global/ProtectedRoute'
import { Board } from './Board/Board'

export const Planner = () => {
  return (
    <ProtectedRoute>
      <main className='flex min-h-screen flex-col items-center gap-8'>
        <h1 className='text-8xl font-semibold'>Planner</h1>
        <PlannerProvider>
          <Board />
        </PlannerProvider>
      </main>
    </ProtectedRoute>
  )
}
