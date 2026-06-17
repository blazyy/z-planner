import { NextResponse } from 'next/server'

import { cardReorder, entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req

    const parsedColumnId = entityId.safeParse(params.columnId)
    if (!parsedColumnId.success) {
      return jsonError(400, 'Invalid column id')
    }
    const columnId = parsedColumnId.data

    const body = await parseBody(req, cardReorder)
    if (body.error) {
      return body.error
    }
    const { reorderedCardIds } = body.data

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`columns.${columnId}.id`]: columnId },
      { $set: { [`columns.${columnId}.taskCards`]: reorderedCardIds } }
    )

    if (result.matchedCount === 0) {
      return jsonError(404, 'Column not found')
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  }
)
