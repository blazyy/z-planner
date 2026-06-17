import { NextResponse } from 'next/server'

import { entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

export const DELETE = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req

    const parsedColumnId = entityId.safeParse(params.columnId)
    if (!parsedColumnId.success) {
      return jsonError(400, 'Invalid column id')
    }
    const parsedCardId = entityId.safeParse(params.cardId)
    if (!parsedCardId.success) {
      return jsonError(400, 'Invalid card id')
    }
    const columnId = parsedColumnId.data
    const cardId = parsedCardId.data

    const planner = await Planner.findOne({ clerkUserId: userId }).lean()
    const card = planner?.taskCards?.[cardId]
    if (!planner || !card) {
      return jsonError(404, 'Card not found')
    }

    // Cascade: the card and its subtasks go together, in one atomic update.
    const unset: Record<string, ''> = { [`taskCards.${cardId}`]: '' }
    for (const subTaskId of card.subTasks) {
      unset[`subTasks.${subTaskId}`] = ''
    }

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`taskCards.${cardId}.id`]: cardId },
      {
        $unset: unset,
        $pull: { [`columns.${columnId}.taskCards`]: cardId },
      }
    )

    if (result.matchedCount === 0) {
      return jsonError(404, 'Card not found')
    }

    return NextResponse.json({ deleted: cardId })
  }
)
