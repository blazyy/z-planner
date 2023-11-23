import { MongoClient, ServerApiVersion } from 'mongodb'

const client = new MongoClient(`${process.env.NEXT_PUBLIC_MONGO_URI}`, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export async function POST(req: Request) {
  const requestBody = await req.json()
  try {
    await client.connect()
    const db = client.db('planner')
    const res = await db
      .collection('planner')
      .updateOne({ 'boards.board-1.id': 'board-1' }, { $set: { 'boards.board-1.columns': requestBody.newColumnOrder } })
    return Response.json(res)
  } catch (error) {
    console.error('MongoDB Error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await client.close()
  }
}
