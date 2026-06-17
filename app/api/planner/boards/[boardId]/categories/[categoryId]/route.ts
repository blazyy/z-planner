import { NextResponse } from 'next/server'

import { UNASSIGNED_CATEGORY_ID } from '@/constants/constants'
import { categoryId as categoryIdSchema, entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

export const DELETE = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { boardId, categoryId } = params
    if (!entityId.safeParse(boardId).success) {
      return jsonError(400, 'Invalid board id')
    }
    if (!categoryIdSchema.safeParse(categoryId).success) {
      return jsonError(400, 'Invalid category id')
    }
    if (categoryId === UNASSIGNED_CATEGORY_ID) {
      return jsonError(400, 'The default category cannot be deleted')
    }

    const planner = await Planner.findOne({ clerkUserId: userId }).lean()
    if (!planner || !planner.categories[categoryId!]) {
      return jsonError(404, 'Category not found')
    }

    const reassignedCards = Object.fromEntries(
      Object.entries(planner.taskCards)
        .filter(([, taskCard]) => taskCard.category === categoryId)
        .map(([taskCardId]) => [`taskCards.${taskCardId}.category`, UNASSIGNED_CATEGORY_ID])
    )

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`categories.${categoryId}.id`]: categoryId },
      {
        $unset: { [`categories.${categoryId}`]: '' },
        $pull: { [`boards.${boardId}.categories`]: categoryId },
        ...(Object.keys(reassignedCards).length > 0 && { $set: reassignedCards }),
      }
    )
    if (result.matchedCount === 0) {
      return jsonError(404, 'Category not found')
    }

    return NextResponse.json({ deleted: categoryId }, { status: 200 })
  }
)
