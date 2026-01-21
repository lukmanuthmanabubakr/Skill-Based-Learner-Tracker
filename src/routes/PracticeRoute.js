import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  createPracticeSession,
  getPracticeSession,
  updateSessionPractice,
  deletePracticeSession,
} from "../controllers/practiceControllers.js";

const practiceRoute = express.Router();

practiceRoute.post("/skills/:skillId", protect, createPracticeSession);
practiceRoute.get("/", protect, getPracticeSession);
practiceRoute.patch("/:practiceId", protect, updateSessionPractice);
practiceRoute.delete("/:practiceId", protect, deletePracticeSession);

export default practiceRoute;
