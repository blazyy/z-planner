import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface ReorderCardsRequestBody {
  reorderedCardIds: string[]
}

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { columnId } = params
    const { reorderedCardIds }: ReorderCardsRequestBody = await req.json()

    await Planner.updateOne(
      { clerkUserId: userId, [`columns.${columnId}.id`]: columnId },
      { $set: { [`columns.${columnId}.taskCards`]: reorderedCardIds } }
    )

    return NextResponse.json({ status: 204 })
  }
)
