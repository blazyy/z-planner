import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { vi } from 'vitest'

/*
 * In-memory Mongo for in-process route tests.
 *
 * GOTCHA being defused: @/lib/dbConnect caches a single global mongoose
 * connection keyed off process.env.MONGO_URI read at connect time. If a route
 * (or its transitive imports) connected before we pointed it at the mem server,
 * every test would hit the cached real-URI connection. Two guards:
 *   1) startMemoryMongo() sets process.env.MONGO_URI to the mem-server uri.
 *   2) We vi.mock('@/lib/dbConnect') to a connector that mongoose.connect()s to
 *      that uri and is idempotent, so models bind to the mem connection no
 *      matter the import order.
 * Models (models/Planner.ts) bind lazily via mongoose.models.Planner ||
 * mongoose.model(...), so they attach to whatever connection mongoose holds.
 */

let mem: MongoMemoryServer | null = null

vi.mock('@/lib/dbConnect', () => ({
  // Mirrors the real default export: returns the connected mongoose instance,
  // reusing the open connection so repeated route calls don't reconnect.
  default: async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI as string, { bufferCommands: false })
    }
    return mongoose
  },
}))

/**
 * Boot the mem server, point MONGO_URI at it, and open the mongoose connection
 * eagerly so resetDb() has live collections even before the first route call.
 * Call once in beforeAll. First run downloads a mongod binary (~150MB) and can
 * take a while, hence the bumped hookTimeout in vitest.config.ts.
 */
export async function startMemoryMongo(): Promise<string> {
  if (!mem) {
    mem = await MongoMemoryServer.create()
  }
  const uri = mem.getUri()
  process.env.MONGO_URI = uri
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { bufferCommands: false })
  }
  return uri
}

/** Tear down the connection and mem server. Call once in afterAll. */
export async function stopMemoryMongo(): Promise<void> {
  await mongoose.disconnect()
  if (mem) {
    await mem.stop()
    mem = null
  }
}

/** Wipe every collection between tests so each case starts from a clean DB. */
export async function resetDb(): Promise<void> {
  const { collections } = mongoose.connection
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
}
