import mongoose from "mongoose";

declare global {
  var mongooseConnection:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

function getMongoUri() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  return mongoUri;
}

const globalCache = globalThis.mongooseConnection ?? {
  conn: null,
  promise: null,
};

globalThis.mongooseConnection = globalCache;

export async function connectToDatabase() {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    mongoose.set("strictQuery", true);

    globalCache.promise = mongoose.connect(getMongoUri(), {
      dbName: "zelos",
      bufferCommands: false,
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
