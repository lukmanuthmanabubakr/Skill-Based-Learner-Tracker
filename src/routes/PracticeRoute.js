import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  createPracticeSession,
  getPracticeSession,
  updateSessionPractice,
  deletePracticeSession,
} from "../controllers/practiceControllers.js";

const practiceRoute = express.Router();

practiceRoute.post("/", protect, createPracticeSession);
practiceRoute.get("/", protect, getPracticeSession);
practiceRoute.patch("/:id", protect, updateSessionPractice);
practiceRoute.delete("/:id", protect, deletePracticeSession);

export default practiceRoute;
