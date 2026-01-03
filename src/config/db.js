import mongoose from "mongoose";
import mongoURI from "./env.js";

async function connectDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected successfully to MongoDB!");
  } catch (error) {
    console.error("Connection failed:", error);
  }
}
export default connectDB;
