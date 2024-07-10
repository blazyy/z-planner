import { ExtendedNextRequest, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface MoveCardRequestBody {
  sourceColumnId: string
  destColumnId: string
  sourceColumnTaskCardIds: string[]
  destColumnTaskCardIds: string[]
}

export const PATCH = withMiddleware(async (req: ExtendedNextRequest): Promise<NextResponse> => {
  const { userId } = req
  const { sourceColumnId, destColumnId, sourceColumnTaskCardIds, destColumnTaskCardIds }: MoveCardRequestBody =
    await req.json()

  await Planner.updateMany(
    {
      clerkUserId: userId,
      $or: [{ [`columns.${sourceColumnId}.id`]: sourceColumnId }, { [`columns.${destColumnId}.id`]: destColumnId }],
    },
    {
      $set: {
        [`columns.${sourceColumnId}.taskCards`]: sourceColumnTaskCardIds,
        [`columns.${destColumnId}.taskCards`]: destColumnTaskCardIds,
      },
    }
  )

  return NextResponse.json({ status: 204 })
})
