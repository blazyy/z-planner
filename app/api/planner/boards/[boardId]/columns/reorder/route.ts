import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface ChangeColumnOrderRequestBody {
  newColumnOrder: string[]
}

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { boardId } = params
    const { newColumnOrder }: ChangeColumnOrderRequestBody = await req.json()

    await Planner.updateOne(
      { clerkUserId: userId, [`boards.${boardId}.id`]: boardId },
      { $set: { [`boards.${boardId}.columns`]: newColumnOrder } }
    )

    return NextResponse.json({ status: 204 })
  }
)
