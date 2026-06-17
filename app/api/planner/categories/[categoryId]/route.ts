import { NextResponse } from 'next/server'

import { categoryId as categoryIdSchema, categoryPatch } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { categoryId } = params
    if (!categoryIdSchema.safeParse(categoryId).success) {
      return jsonError(400, 'Invalid category id')
    }

    const body = await parseBody(req, categoryPatch)
    if (body.error) return body.error
    const { newName, newColor } = body.data

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`categories.${categoryId}.id`]: categoryId },
      {
        $set: {
          [`categories.${categoryId}.name`]: newName,
          [`categories.${categoryId}.color`]: newColor,
        },
      }
    )
    if (result.matchedCount === 0) {
      return jsonError(404, 'Category not found')
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  }
)
