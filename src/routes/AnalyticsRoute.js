import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  getSkillProgress,
  getUserSummary,
  getSkillTimeline,
  getUserStreaks,
} from "../controllers/analyticsControllers.js";

const router = express.Router();

router.use(protect);

router.get("/skills/:skillId/progress", getSkillProgress);
router.get("/user/summary", getUserSummary);
router.get("/skills/:skillId/timeline", getSkillTimeline);
router.get("/user/streaks", getUserStreaks);

export default router;
