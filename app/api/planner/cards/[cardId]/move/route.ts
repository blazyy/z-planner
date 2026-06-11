import { cardMove, entityId } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req

    const parsedCardId = entityId.safeParse(params.cardId)
    if (!parsedCardId.success) {
      return jsonError(400, 'Invalid card id')
    }
    const cardId = parsedCardId.data

    const body = await parseBody(req, cardMove)
    if (body.error) {
      return body.error
    }
    const { sourceColumnId, destColumnId, sourceColumnTaskCardIds, destColumnTaskCardIds } = body.data

    if (!destColumnTaskCardIds.includes(cardId)) {
      return jsonError(400, 'Moved card must appear in the destination column card list')
    }

    // Both columns must exist — prevents the half-applied update the old $or filter allowed.
    const result = await Planner.updateOne(
      {
        clerkUserId: userId,
        [`columns.${sourceColumnId}.id`]: sourceColumnId,
        [`columns.${destColumnId}.id`]: destColumnId,
      },
      {
        $set: {
          [`columns.${sourceColumnId}.taskCards`]: sourceColumnTaskCardIds,
          [`columns.${destColumnId}.taskCards`]: destColumnTaskCardIds,
        },
      }
    )

    if (result.matchedCount === 0) {
      return jsonError(404, 'Column not found')
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  }
)
