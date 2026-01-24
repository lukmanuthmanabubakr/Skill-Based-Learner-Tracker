import express from "express";
import connectDB from "./src/config/db.js";
import userRoutes from "./src/routes/UserRoutes.js";
import skillsRouter from "./src/routes/SkillsRoute.js";
import practiceRoute from "./src/routes/PracticeRoute.js";
import evidenceRoute from "./src/routes/EvidenceRoute.js";
import analyticsRoute from "./src/routes/AnalyticsRoute.js";
import rankingRoute from "./src/routes/RankingRoute.js";
import {
  globalRateLimit,
  authRateLimit,
  skillsRateLimit,
  analyticsRateLimit,
  rankingRateLimit,
} from "./src/middleware/rateLimitMiddleware.js";
import correlationIdMiddleware from "./src/middleware/correlationId.js";
import errorHandler from "./src/middleware/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";

import "./src/modules/users/user.schema.js";
import "./src/modules/users/skills.schema.js";
import "./src/modules/users/practiceLog.schema.js";
import "./src/modules/users/evidenceLog.schema.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(correlationIdMiddleware);
app.use(globalRateLimit);

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      tagsSorter: (a, b) => {
        const order = [
          "Auth",
          "Skills",
          "Practice Logs",
          "Evidence",
          "Analytics",
          "Rankings",
        ];
        return order.indexOf(a) - order.indexOf(b);
      },
      operationsSorter: "method", // optional: sorts GET/POST/PATCH/DELETE inside a tag
    },
  }),
);
app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/auth", authRateLimit, userRoutes);
app.use("/api/skills", skillsRateLimit, skillsRouter);
app.use("/api/practice-logs", skillsRateLimit, practiceRoute);
app.use("/api/evidence", skillsRateLimit, evidenceRoute);
app.use("/api/analytics", analyticsRateLimit, analyticsRoute);
app.use("/api/rankings", rankingRateLimit, rankingRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5050;

async function skillBased() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}
skillBased();
