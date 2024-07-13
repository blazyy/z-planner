// pages/api/planner/columns/[columnId]/name/route.ts
import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface ChangeColumnNameRequestBody {
  newName: string
}

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { columnId } = params
    const { newName }: ChangeColumnNameRequestBody = await req.json()

    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $set: {
          [`columns.${columnId}.name`]: newName,
        },
      }
    )

    return NextResponse.json({})
  }
)
