import dotenv from "dotenv";
dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  throw new Error("MONGO_URI is missing in .env file");
}

export default mongoURI;
