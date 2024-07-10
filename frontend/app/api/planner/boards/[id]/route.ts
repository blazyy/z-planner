import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const PATCH = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
  const { id } = params
  const { userId } = req
  const { newName } = await req.json()
  try {
    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $set: {
          [`boards.${id}.name`]: newName,
        },
      }
    )
    return NextResponse.json({ status: 200, message: 'Board name changed successfully' })
  } catch (error) {
    return NextResponse.json({ status: 500, error: 'Internal Server Error' })
  }
})

export const DELETE = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
  const { userId } = req
  const { id } = params
  try {
    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $pull: {
          boardOrder: id,
        },
        $unset: {
          [`boards.${id}`]: '',
        },
      }
    )
    return NextResponse.json({ status: 204, message: 'Board deleted successfully' })
  } catch (error) {
    return NextResponse.json({ status: 500, error: 'Internal Server Error' })
  }
})
