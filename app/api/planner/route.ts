import { TaskCardInfoType } from '@/hooks/Planner/types'
import { ExtendedNextRequest, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const GET = withMiddleware(async (req: ExtendedNextRequest) => {
  const { userId } = req
  let user = await Planner.findOne({ clerkUserId: userId }).lean()

  if (!user) {
    user = new Planner({
      clerkUserId: userId,
      boardOrder: [],
      boards: {},
      columns: {},
      categories: {},
      taskCards: {},
      subTasks: {},
    })
    await user.save()
    user = user.toObject()
  } else {
    // Update task cards with status 'completed' to 'archived'. This is because the task cards are
    // shown in the UI whenever they're completed, but on subsequent API calls, they should not be shown.
    // These cards will only be shown in the archive section.
    const updatedTaskCards = { ...user.taskCards }
    const updatedColumns = { ...user.columns }

    for (const taskId in updatedTaskCards) {
      if (updatedTaskCards[taskId].status === 'completed') {
        updatedTaskCards[taskId].status = 'archived'
        // Remove archived task cards from their columns
        for (const columnId in updatedColumns) {
          const column = updatedColumns[columnId]
          const taskIndex = column.taskCards.indexOf(taskId)
          if (taskIndex > -1) {
            column.taskCards.splice(taskIndex, 1)
          }
        }
      }
    }
    await Planner.updateOne({ clerkUserId: userId }, { taskCards: updatedTaskCards, columns: updatedColumns })

    // Filter task cards to only return those with status 'created'
    user.taskCards = Object.fromEntries(
      Object.entries(updatedTaskCards).filter(([_, taskCard]) => (taskCard as TaskCardInfoType).status === 'created')
    )
  }

  return NextResponse.json(user)
})
