import mongoose, { Mongoose } from 'mongoose'

const MONGO_URI: string | undefined = process.env.MONGO_URI

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable')
}

interface CachedType {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

declare global {
  // Allow access to this globally in the Node.js process
  // eslint-disable-next-line no-var
  var mongoose: CachedType
}

let cached: CachedType = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default dbConnect
