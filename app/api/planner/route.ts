import { MongoClient, ServerApiVersion } from 'mongodb'

const client = new MongoClient(`${process.env.NEXT_PUBLIC_MONGO_URI}`, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await client.connect()
    const database = client.db('planner')
    const planner = database.collection('planner')
    const res = await planner.findOne({ username: 'user1' })
    return Response.json(res)
  } catch (error) {
    console.error('MongoDB Error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await client.close()
  }
}
