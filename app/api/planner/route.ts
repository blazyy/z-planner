import { MongoClient, ServerApiVersion } from 'mongodb'
import { useErrorBoundary } from 'react-error-boundary'

const client = new MongoClient(`${process.env.NEXT_PUBLIC_MONGO_URI}`, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export async function GET() {
  const { showBoundary: showErrorBoundary } = useErrorBoundary()
  try {
    await client.connect()
    const db = client.db('plasnner')
    const res = await db.collection('planner').findOne(
      { username: 'user1' },
      {
        projection: { boardOrder: 1, boards: 1, columns: 1, categories: 1, taskCards: 1, subTasks: 1, _id: 0 },
      }
    )
    if (res === null) return Response.json({ error: 'Data not found' }, { status: 404 })
    return Response.json(res)
  } catch (error) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  } finally {
    await client.close()
  }
}
