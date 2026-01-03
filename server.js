import express from "express";
import connectDB from "./src/config/db.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/status", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 2009;

async function skillBased() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}
skillBased();
