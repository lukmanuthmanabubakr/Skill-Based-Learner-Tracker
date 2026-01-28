import express from "express";
import connectDB from "./config/db.js";

import userRoutes from "./routes/UserRoutes.js";
import skillsRouter from "./routes/SkillsRoute.js";
import practiceRoute from "./routes/PracticeRoute.js";
import evidenceRoute from "./routes/EvidenceRoute.js";
import analyticsRoute from "./routes/AnalyticsRoute.js";
import rankingRoute from "./routes/RankingRoute.js";

import {
  globalRateLimit,
  authRateLimit,
  skillsRateLimit,
  analyticsRateLimit,
  rankingRateLimit,
} from "./middleware/rateLimitMiddleware.js";

import correlationIdMiddleware from "./middleware/correlationId.js";
import errorHandler from "./middleware/errorHandler.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../docs/swagger.js";
import cors from "cors";

// Import schemas to register them
import "./modules/users/user.schema.js";
import "./modules/users/skills.schema.js";
import "./modules/users/practiceLog.schema.js";
import "./modules/users/evidenceLog.schema.js";

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://skill-based-learner-tracker.vercel.app",
    ],

    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(correlationIdMiddleware);
app.use(globalRateLimit);

// Swagger Docs
app.use("/api/docs", swaggerUi.serve);
app.get("/api/docs", swaggerUi.setup(swaggerSpec));
app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));

app.get("/", (req, res) => res.json({ status: "OK" }));

// ROUTES
app.use("/api/auth", authRateLimit, userRoutes);
app.use("/api/skills", skillsRateLimit, skillsRouter);
app.use("/api/practice-logs", skillsRateLimit, practiceRoute);
app.use("/api/evidence", skillsRateLimit, evidenceRoute);
app.use("/api/analytics", analyticsRateLimit, analyticsRoute);
app.use("/api/rankings", rankingRateLimit, rankingRoute);

// Error handler LAST
app.use(errorHandler);

// Connect DB once per serverless instance
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

export default app;
