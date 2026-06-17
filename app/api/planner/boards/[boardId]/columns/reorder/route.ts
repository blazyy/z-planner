import { NextResponse } from 'next/server'

import { columnReorder, entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, jsonError, Params, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const boardIdResult = entityId.safeParse(params.boardId)
    if (!boardIdResult.success) {
      return jsonError(400, 'Invalid board id')
    }
    const boardId = boardIdResult.data
    const body = await parseBody(req, columnReorder)
    if (body.error) {
      return body.error
    }
    const { newColumnOrder } = body.data

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`boards.${boardId}.id`]: boardId },
      { $set: { [`boards.${boardId}.columns`]: newColumnOrder } }
    )
    if (result.matchedCount === 0) {
      return jsonError(404, 'Board not found')
    }

    return NextResponse.json({ updated: boardId })
  }
)
