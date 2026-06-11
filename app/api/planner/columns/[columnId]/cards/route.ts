import { cardCreate, entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const POST = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req

    const parsedColumnId = entityId.safeParse(params.columnId)
    if (!parsedColumnId.success) {
      return jsonError(400, 'Invalid column id')
    }
    const columnId = parsedColumnId.data

    const body = await parseBody(req, cardCreate)
    if (body.error) {
      return body.error
    }
    const { newTaskCardDetails: newCard, updatedTaskCards } = body.data

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`columns.${columnId}.id`]: columnId },
      {
        $set: {
          [`columns.${columnId}.taskCards`]: updatedTaskCards,
          [`taskCards.${newCard.id}`]: newCard,
        },
      }
    )

    if (result.matchedCount === 0) {
      return jsonError(404, 'Column not found')
    }

    return NextResponse.json({ cardId: newCard.id }, { status: 201 })
  }
)
