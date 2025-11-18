import mongoose, { Connection, Mongoose } from "mongoose";

/**
 * The shape of our cached MongoDB connection stored on the global object.
 *
 * `conn` holds the active Mongoose instance once connected.
 * `promise` holds the in-flight connection attempt so concurrent callers
 * can share it instead of creating multiple connections.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the Node.js global type to include our Mongoose cache.
 *
 * This avoids TypeScript errors when we attach `mongoose` to `global`.
 * The declaration is safe because it's only adding a typed property.
 */
declare global {
  // `var` is required here because we're augmenting the Node `global` object
  // that already exists at runtime.
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

// Initialize the cache on the global object (in development) or
// a module-level variable (in serverless/edge environments).
// Using a global cache prevents creating multiple connections during HMR.
const cached: MongooseCache = global._mongoose ?? {
  conn: null,
  promise: null,
};

if (!global._mongoose) {
  global._mongoose = cached;
}

/**
 * Connect to MongoDB using Mongoose.
 *
 * - Uses a global cache to prevent multiple connections in development.
 * - Reuses the same connection across serverless invocations when possible.
 *
 * Throws an error if `MONGODB_URI` is not defined.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  const uri = process.env.MONGODB_URL;

  if (!uri) {
    throw new Error("Please define the MONGODB_URL environment variable.");
  }

  // If we already have an active connection, reuse it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is already in progress, wait for it.
  if (!cached.promise) {
    const options: Parameters<typeof mongoose.connect>[1] = {
      // Recommended Mongoose options for modern MongoDB drivers.
      bufferCommands: false,
      // Add any other options you rely on here.
    };

    cached.promise = mongoose.connect(uri, options);
  }

  // Await the in-flight promise and cache the resolved connection.
  // If the connection fails, clear the cached promise so that subsequent
  // calls can attempt to reconnect instead of reusing a rejected promise.
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
}

/**
 * Utility function to get the active Mongoose connection.
 *
 * This is optional but can be useful when you only need access to the
 * connection after it has been established elsewhere.
 */
export function getMongooseConnection(): Connection | null {
  return cached.conn ? cached.conn.connection : null;
}

export default connectToDatabase;
