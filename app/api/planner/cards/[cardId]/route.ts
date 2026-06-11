import { cardPatch, entityId } from '@/lib/apiSchemas'
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

    const body = await parseBody(req, cardPatch)
    if (body.error) {
      return body.error
    }
    const { title, content, status, category, columnId, taskCardOrder } = body.data

    // Explicit allowlist — body keys never reach the $set path directly.
    const update: Record<string, unknown> = {}
    if (title !== undefined) {
      update[`taskCards.${cardId}.title`] = title
    }
    if (content !== undefined) {
      update[`taskCards.${cardId}.content`] = content
    }
    if (status !== undefined) {
      update[`taskCards.${cardId}.status`] = status
    }
    if (category !== undefined) {
      update[`taskCards.${cardId}.category`] = category
    }

    const filter: Record<string, unknown> = { clerkUserId: userId, [`taskCards.${cardId}.id`]: cardId }
    if (columnId !== undefined && taskCardOrder !== undefined) {
      filter[`columns.${columnId}.id`] = columnId
      update[`columns.${columnId}.taskCards`] = taskCardOrder
    }

    const result = await Planner.updateOne(filter, { $set: update })

    if (result.matchedCount === 0) {
      return jsonError(404, 'Card not found')
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  }
)
