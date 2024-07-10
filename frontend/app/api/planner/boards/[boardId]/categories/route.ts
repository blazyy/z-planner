// pages/api/planner/boards/[boardId]/categories/route.ts
import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface AddNewCategoryRequestBody {
  newCategoryDetails: { id: string; [key: string]: any }
}

export const POST = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { boardId } = params
    const { newCategoryDetails }: AddNewCategoryRequestBody = await req.json()

    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $set: {
          [`categories.${newCategoryDetails.id}`]: newCategoryDetails,
        },
      }
    )

    await Planner.updateOne(
      { clerkUserId: userId },
      { $push: { [`boards.${boardId}.categories`]: newCategoryDetails.id } }
    )

    return NextResponse.json({ status: 201 })
  }
)
