import express from "express";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/UserRoutes.js";
import skillsRouter from "./src/routes/SkillsRoute.js";
import practiceRoute from "./src/routes/PracticeRoute.js";
import evidenceRoute from "./src/routes/EvidenceRoute.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/auth", userRoutes);
app.use("/api/skills", skillsRouter);
app.use("/api/practice-logs", practiceRoute);
app.use("/api/evidence", evidenceRoute);

const PORT = process.env.PORT || 5050;

async function skillBased() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}
skillBased();
