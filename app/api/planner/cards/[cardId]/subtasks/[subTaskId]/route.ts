import { NextResponse } from 'next/server'

import { entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

export const DELETE = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req

    const parsedCardId = entityId.safeParse(params.cardId)
    if (!parsedCardId.success) {
      return jsonError(400, 'Invalid card id')
    }
    const parsedSubTaskId = entityId.safeParse(params.subTaskId)
    if (!parsedSubTaskId.success) {
      return jsonError(400, 'Invalid subtask id')
    }
    const cardId = parsedCardId.data
    const subTaskId = parsedSubTaskId.data

    // Remove the subtask entry and its reference in the card's order array atomically.
    const result = await Planner.updateOne(
      { clerkUserId: userId, [`taskCards.${cardId}.id`]: cardId },
      {
        $unset: { [`subTasks.${subTaskId}`]: '' },
        $pull: { [`taskCards.${cardId}.subTasks`]: subTaskId },
      }
    )

    if (result.matchedCount === 0) {
      return jsonError(404, 'Card not found')
    }

    return NextResponse.json({ deleted: subTaskId })
  }
)
