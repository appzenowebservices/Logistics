import mongoose from "mongoose";

function getMongoUri() {
  const uri =
    process.env.DATABASE_URL ||
    process.env.MONGODB_URI ||
    // local dev fallback — keeps `next dev` / `next build` from crashing
    // when env is missing; real deployments must set DATABASE_URL.
    "mongodb://localhost:27017/alms_logistics";
  return uri;
}

const globalForDb = globalThis as typeof globalThis & {
  __addieslogisticsMongoConnection?: typeof mongoose;
};

export async function connectDB() {
  if (globalForDb.__addieslogisticsMongoConnection) {
    return globalForDb.__addieslogisticsMongoConnection;
  }

  try {
    await mongoose.connect(getMongoUri());
    globalForDb.__addieslogisticsMongoConnection = mongoose;

    return mongoose;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Database connection failed: ${message}`);
  }
}

export { mongoose };
