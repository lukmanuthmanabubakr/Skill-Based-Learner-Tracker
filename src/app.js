import express from "express";
import cors from "cors";
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
import { swaggerSpec } from "../docs/swagger.js";

import "./modules/users/user.schema.js";
import "./modules/users/skills.schema.js";
import "./modules/users/practiceLog.schema.js";
import "./modules/users/evidenceLog.schema.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://skill-based-learner-tracker.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(correlationIdMiddleware);
app.use(globalRateLimit);

app.get("/api/docs/swagger.json", (req, res) => res.status(200).json(swaggerSpec));
app.get("/api/docs.json", (req, res) => res.status(200).json(swaggerSpec));

app.get("/api/docs", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SkillBased Tracker API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function () {
      SwaggerUIBundle({
        url: "/api/docs/swagger.json",
        dom_id: "#swagger-ui",
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`);
});

app.get("/", (req, res) => res.status(200).json({ status: "OK" }));

let isConnected = false;
const ensureDb = async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
};

app.use("/api/auth", ensureDb, authRateLimit, userRoutes);
app.use("/api/skills", ensureDb, skillsRateLimit, skillsRouter);
app.use("/api/practice-logs", ensureDb, skillsRateLimit, practiceRoute);
app.use("/api/evidence", ensureDb, skillsRateLimit, evidenceRoute);
app.use("/api/analytics", ensureDb, analyticsRateLimit, analyticsRoute);
app.use("/api/rankings", ensureDb, rankingRateLimit, rankingRoute);

app.use(errorHandler);

export default app;
