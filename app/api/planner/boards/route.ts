import { boardCreate } from '@/lib/apiSchemas'
import { ExtendedNextRequest, jsonError, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const POST = withMiddleware(async (req: ExtendedNextRequest) => {
  const { userId } = req
  const body = await parseBody(req, boardCreate)
  if (body.error) {
    return body.error
  }
  const { boardId, boardName, unassignedCategoryDetails } = body.data

  const result = await Planner.updateOne(
    { clerkUserId: userId },
    {
      $push: {
        boardOrder: boardId,
      },
      $set: {
        [`boards.${boardId}`]: {
          id: boardId,
          name: boardName,
          columns: [],
          categories: [unassignedCategoryDetails.id],
        },
        [`categories.${unassignedCategoryDetails.id}`]: unassignedCategoryDetails,
      },
    }
  )
  if (result.matchedCount === 0) {
    return jsonError(404, 'Planner not found')
  }
  return NextResponse.json({ boardId }, { status: 201 })
})
