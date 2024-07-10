import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const DELETE = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { cardId, subTaskId } = params

    // Remove the subtask from the subtask object using $unset
    await Planner.updateOne({ clerkUserId: userId }, { $unset: { [`subTasks.${subTaskId}`]: '' } })

    // Remove the subtask from the subtask list within the specified taskcard using $pull
    await Planner.updateOne(
      { clerkUserId: userId, [`taskCards.${cardId}.id`]: cardId },
      { $pull: { [`taskCards.${cardId}.subTasks`]: subTaskId } }
    )

    return NextResponse.json({ status: 204 })
  }
)
