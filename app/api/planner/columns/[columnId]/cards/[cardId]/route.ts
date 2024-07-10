import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const DELETE = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { columnId, cardId } = params

    await Planner.updateOne({ clerkUserId: userId }, { $unset: { [`taskCards.${cardId}`]: '' } })

    await Planner.updateOne(
      { clerkUserId: userId, [`columns.${columnId}.id`]: columnId },
      { $pull: { [`columns.${columnId}.taskCards`]: cardId } }
    )

    return NextResponse.json({ status: 204 })
  }
)
