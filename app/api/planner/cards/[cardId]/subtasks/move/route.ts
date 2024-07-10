// pages/api/planner/cards/[taskCardId]/subtasks/move/route.ts
import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface MoveSubtaskRequestBody {
  reorderedSubTasks: string[]
}

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { cardId } = params
    const { reorderedSubTasks }: MoveSubtaskRequestBody = await req.json()

    await Planner.updateOne(
      { clerkUserId: userId, [`taskCards.${cardId}.id`]: cardId },
      { $set: { [`taskCards.${cardId}.subTasks`]: reorderedSubTasks } }
    )

    return NextResponse.json({ status: 204 })
  }
)
