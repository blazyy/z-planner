import { NextResponse } from 'next/server'

import { entityId, subTaskCreate } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

export const POST = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req

    const parsedCardId = entityId.safeParse(params.cardId)
    if (!parsedCardId.success) {
      return jsonError(400, 'Invalid card id')
    }
    const cardId = parsedCardId.data

    const body = await parseBody(req, subTaskCreate)
    if (body.error) {
      return body.error
    }
    const { newSubTaskDetails, newSubTasksOrder } = body.data

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`taskCards.${cardId}.id`]: cardId },
      {
        $set: {
          [`taskCards.${cardId}.subTasks`]: newSubTasksOrder,
          [`subTasks.${newSubTaskDetails.id}`]: newSubTaskDetails,
        },
      }
    )

    if (result.matchedCount === 0) {
      return jsonError(404, 'Card not found')
    }

    return NextResponse.json({ subTaskId: newSubTaskDetails.id }, { status: 201 })
  }
)
