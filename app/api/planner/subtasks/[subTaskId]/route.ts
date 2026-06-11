import { entityId, subTaskPatch } from '@/lib/apiSchemas'
import { ExtendedNextRequest, Params, jsonError, parseBody, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req

    const parsedSubTaskId = entityId.safeParse(params.subTaskId)
    if (!parsedSubTaskId.success) {
      return jsonError(400, 'Invalid subtask id')
    }
    const subTaskId = parsedSubTaskId.data

    const body = await parseBody(req, subTaskPatch)
    if (body.error) {
      return body.error
    }

    // Build the update from the validated fields only — never from raw body keys.
    const updateFields: Record<string, string | boolean> = {}
    if (body.data.title !== undefined) {
      updateFields[`subTasks.${subTaskId}.title`] = body.data.title
    }
    if (body.data.checked !== undefined) {
      updateFields[`subTasks.${subTaskId}.checked`] = body.data.checked
    }

    const result = await Planner.updateOne(
      { clerkUserId: userId, [`subTasks.${subTaskId}.id`]: subTaskId },
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return jsonError(404, 'Subtask not found')
    }

    return NextResponse.json({ ok: true })
  }
)
