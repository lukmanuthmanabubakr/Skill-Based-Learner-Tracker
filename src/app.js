import express from "express";
import cors from "cors";
import swaggerUiDist from "swagger-ui-dist";
import { swaggerSpec } from "../docs/swagger.js";
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

const swaggerPath = swaggerUiDist.getAbsoluteFSPath();
app.get("/api/docs/swagger-ui.css", (req, res) => {
  res.sendFile(`${swaggerPath}/swagger-ui.css`);
});

app.use("/api/docs", express.static(swaggerPath));

app.get("/api/docs/swagger.json", (req, res) => res.json(swaggerSpec));

app.get("/api/docs", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SkillBased Tracker API Docs</title>
  <link rel="stylesheet" href="/api/docs/swagger-ui.css" />
  <link rel="icon" type="image/png" href="/api/docs/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="/api/docs/favicon-16x16.png" sizes="16x16" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/api/docs/swagger-ui-bundle.js"></script>
  <script src="/api/docs/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function () {
      SwaggerUIBundle({
        url: "/api/docs/swagger.json",
        dom_id: "#swagger-ui",
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
`);
});

app.get("/", (req, res) => res.json({ status: "OK" }));

let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

app.use("/api/auth", authRateLimit, userRoutes);
app.use("/api/skills", skillsRateLimit, skillsRouter);
app.use("/api/practice-logs", skillsRateLimit, practiceRoute);
app.use("/api/evidence", skillsRateLimit, evidenceRoute);
app.use("/api/analytics", analyticsRateLimit, analyticsRoute);
app.use("/api/rankings", rankingRateLimit, rankingRoute);

app.use(errorHandler);

export default app;
