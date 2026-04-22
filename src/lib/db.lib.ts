import mongoose from "mongoose";

/**
 * Connects to the MongoDB database using the connection string from environment variables.
 * @throws {Error} If the connection fails.
 */
export async function connectDB() {
    await mongoose.connect(process.env.DB_URL as string);
    console.log("Connected to database");
}