'use client'
import { useDatabase } from '@/hooks/Database/Database'
import { PlannerProvider } from '@/hooks/Planner/Planner'
import { PlannerType } from '@/hooks/Planner/types'
import { useEffect, useState } from 'react'
import { ProtectedRoute } from '../global/ProtectedRoute'
import { AddBoardCallout } from './AddBoardCallout'
import { Board } from './Board/Board'

export const Planner = () => {
  const db = useDatabase()
  const [planner, setPlanner] = useState<PlannerType | null>(null)

  useEffect(() => {
    const getInitialPlannerData = async () => {
      const plannerData = await db.getInitialPlannerData()
      setPlanner({
        isSubTaskBeingDragged: false,
        idOfCardBeingDragged: '',
        taskCardBeingInitialized: null,
        dataEnteredInTaskCardBeingInitialized: false,
        ...plannerData,
      })
    }
    getInitialPlannerData()
  }, [db])

  return (
    <ProtectedRoute>
      <main className='flex min-h-screen flex-col justify-center items-center gap-8'>
        {/* <h1 className='text-8xl font-semibold'>Planner</h1> */}
        {/* <AddBoardCallout /> */}
        <PlannerProvider>{planner?.boardOrder.length === 0 ? <AddBoardCallout /> : <Board />}</PlannerProvider>
      </main>
    </ProtectedRoute>
  )
}
