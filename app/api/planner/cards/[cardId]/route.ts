import { ExtendedNextRequest, Params, withMiddleware } from '@/lib/middleware'
import Planner from '@/models/Planner'
import { NextResponse } from 'next/server'

interface CardModificationRequestBody {
  title?: string
  content?: string
  status?: string
  category?: string
}

export const PATCH = withMiddleware(
  async (req: ExtendedNextRequest, { params }: { params: Params }): Promise<NextResponse> => {
    const { userId } = req
    const { cardId } = params
    const body: CardModificationRequestBody = await req.json()

    const [key, value] = Object.entries(body)[0]
    const updateField = { [`taskCards.${cardId}.${key}`]: value }

    await Planner.updateOne(
      { clerkUserId: userId },
      {
        $set: updateField,
      }
    )

    return NextResponse.json({ status: 204 })
  }
)
