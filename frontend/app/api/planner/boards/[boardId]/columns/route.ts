// pages/api/planner/boards/[boardId]/columns/route.ts
import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface AddNewColumnRequestBody {
  newColumnDetails: { id: string; [key: string]: any }
  updatedColumns: string[]
}

export const POST = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { boardId } = params
    const { newColumnDetails, updatedColumns }: AddNewColumnRequestBody = await req.json()

    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $set: {
          [`boards.${boardId}.columns`]: updatedColumns,
          [`columns.${newColumnDetails.id}`]: newColumnDetails,
        },
      }
    )

    return NextResponse.json({ status: 201 })
  }
)
