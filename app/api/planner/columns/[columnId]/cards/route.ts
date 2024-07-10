// pages/api/planner/columns/[columnId]/cards/route.ts
import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

export const POST = withMiddleware(async (req: ExtendedNextRequest, { params }: { params: Params }) => {
  const { userId } = req
  const { columnId } = params
  const { newTaskCardDetails: newCard, updatedTaskCards } = await req.json()

  await Planner.updateOne(
    { clerkUserId: userId },
    {
      $set: {
        [`columns.${columnId}.taskCards`]: updatedTaskCards,
        [`taskCards.${newCard.id}`]: newCard,
      },
    }
  )

  return NextResponse.json({ status: 201 })
})
