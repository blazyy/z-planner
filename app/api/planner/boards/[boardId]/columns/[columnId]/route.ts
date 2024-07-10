// pages/api/planner/boards/[boardId]/columns/[columnId]/route.ts
import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const DELETE = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { boardId, columnId } = params

    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $pull: {
          [`boards.${boardId}.columns`]: columnId,
        },
        $unset: {
          [`columns.${columnId}`]: 1,
        },
      }
    )

    return NextResponse.json({ status: 204 })
  }
)
