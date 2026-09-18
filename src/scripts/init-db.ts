import "dotenv/config";
import mongoose from "mongoose";
import "../db/schema";

async function initDb() {
  try {
    await mongoose.connect(process.env.DATABASE_URL || process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error("Mongo connection has no db handle");
    }
    const collections = await db.listCollections().toArray();
    console.log(`Existing collections: ${collections.map(c => c.name).join(", ")}`);

    const modelNames = Object.keys(mongoose.models);
    console.log(`Registered models: ${modelNames.join(", ")}`);

    for (const name of modelNames) {
      const model = mongoose.models[name];
      if (model) {
        try {
          await model.createCollection();
          console.log(`Collection created/verified: ${name}`);
        } catch (e: any) {
          if (e.codeName === "NamespaceExists") {
            console.log(`Collection already exists: ${name}`);
          } else {
            console.error(`Failed to create collection ${name}:`, e.message);
          }
        }
      }
    }

    console.log("Database initialization complete!");
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

initDb();