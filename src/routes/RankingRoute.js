import express from "express";
import {
  getRankingByHoursPracticed,
  getRankingByMilestones,
  getUserLeaderboard,
  getSkillLeaderboard,
} from "../controllers/rankingControllers.js";

const router = express.Router();

router.get("/hours-practiced", getRankingByHoursPracticed);
router.get("/milestones", getRankingByMilestones);
router.get("/user-leaderboard", getUserLeaderboard);
router.get("/skill-leaderboard/:skillId", getSkillLeaderboard);

export default router;
