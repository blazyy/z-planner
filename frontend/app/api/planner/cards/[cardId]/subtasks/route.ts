// pages/api/planner/cards/[taskCardId]/subtasks/route.ts
import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface AddNewSubTaskRequestBody {
  newSubTaskDetails: { id: string; [key: string]: any }
  newSubTasksOrder: string[]
}

export const POST = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { cardId } = params
    const { newSubTaskDetails, newSubTasksOrder }: AddNewSubTaskRequestBody = await req.json()

    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $set: {
          [`taskCards.${cardId}.subTasks`]: newSubTasksOrder,
          [`subTasks.${newSubTaskDetails.id}`]: newSubTaskDetails,
        },
      }
    )

    return NextResponse.json({ status: 201 })
  }
)
