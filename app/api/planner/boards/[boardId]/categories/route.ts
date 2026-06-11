import { categoryCreate, entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const POST = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { boardId } = params
    if (!entityId.safeParse(boardId).success) {
      return jsonError(400, 'Invalid board id')
    }

    const body = await parseBody(req, categoryCreate)
    if (body.error) return body.error
    const { newCategoryDetails } = body.data

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`boards.${boardId}.id`]: boardId },
      {
        $set: { [`categories.${newCategoryDetails.id}`]: newCategoryDetails },
        $push: { [`boards.${boardId}.categories`]: newCategoryDetails.id },
      }
    )
    if (result.matchedCount === 0) {
      return jsonError(404, 'Board not found')
    }

    return NextResponse.json({ categoryId: newCategoryDetails.id }, { status: 201 })
  }
)
