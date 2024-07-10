// pages/api/planner/boards/[boardId]/categories/[categoryId]/route.ts
import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const DELETE = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { boardId, categoryId } = params

    const docs = await Planner.findOne({ clerkUserId: userId })
    const updateObject: any = {}

    for (const [key, value] of Object.entries(docs.taskCards)) {
      if ((value as any).category === categoryId) {
        updateObject[`taskCards.${key}.category`] = 'unassigned'
      }
    }

    if (Object.keys(updateObject).length > 0) {
      await Planner.updateOne({ clerkUserId: userId }, { $set: updateObject })
    }

    await Planner.updateOne({ clerkUserId: userId }, { $unset: { [`categories.${categoryId}`]: '' } })
    await Planner.updateOne({ clerkUserId: userId }, { $pull: { [`boards.${boardId}.categories`]: categoryId } })

    return NextResponse.json({ status: 204 })
  }
)
