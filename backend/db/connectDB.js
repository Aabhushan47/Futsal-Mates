import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const url = process.env.MONGO_URL;
    await mongoose.connect(url, { dbName: "Futsal-Mates" });
    console.log("Connected to database");
  } catch (err) {
    console.log("Error while connecting to database", err);
    process.exit(1);
  }
};
