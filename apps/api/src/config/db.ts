import mongoose from "mongoose";
import { logger } from "./logger";

export async function connectDB(uri: string) {
  try {
    if (!uri) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(uri);

    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("Error connecting to MongoDB", error);
    process.exit(1);
  }
}
