// pages/api/planner/categories/[categoryId]/route.ts
import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface ChangeCategoryInfoRequestBody {
  newName: string
  newColor: string
}

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { categoryId } = params
    const { newName, newColor }: ChangeCategoryInfoRequestBody = await req.json()

    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $set: {
          [`categories.${categoryId}.name`]: newName,
          [`categories.${categoryId}.color`]: newColor,
        },
      }
    )

    return NextResponse.json({ status: 201 })
  }
)
