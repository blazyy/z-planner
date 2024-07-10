import { ExtendedNextRequest, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const POST = withMiddleware(async (req: ExtendedNextRequest) => {
  const { userId } = req
  const { boardId, boardName, unassignedCategoryDetails } = await req.json()
  await Planner.updateMany(
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
  return NextResponse.json({ status: 201 })
})
