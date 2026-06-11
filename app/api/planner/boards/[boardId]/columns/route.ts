import { columnCreate, entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, jsonError, Params, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const POST = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const boardIdResult = entityId.safeParse(params.boardId)
    if (!boardIdResult.success) {
      return jsonError(400, 'Invalid board id')
    }
    const boardId = boardIdResult.data
    const body = await parseBody(req, columnCreate)
    if (body.error) {
      return body.error
    }
    const { newColumnDetails, updatedColumns } = body.data

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`boards.${boardId}.id`]: boardId },
      {
        $set: {
          [`boards.${boardId}.columns`]: updatedColumns,
          [`columns.${newColumnDetails.id}`]: newColumnDetails,
        },
      }
    )
    if (result.matchedCount === 0) {
      return jsonError(404, 'Board not found')
    }

    return NextResponse.json({ columnId: newColumnDetails.id }, { status: 201 })
  }
)
