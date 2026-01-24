import express from "express";
import {
  getRankingByHoursPracticed,
  getRankingByMilestones,
  getUserLeaderboard,
  getSkillLeaderboard,
} from "../controllers/rankingControllers.js";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Rankings
 *     description: Public ranking and leaderboard endpoints
 */

/**
 * @openapi
 * /api/rankings/hours-practiced:
 *   get:
 *     tags: [Rankings]
 *     summary: Get rankings by total hours practiced
 *     responses:
 *       200:
 *         description: Rankings returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankingListResponse'
 */
router.get("/hours-practiced", getRankingByHoursPracticed);

/**
 * @openapi
 * /api/rankings/milestones:
 *   get:
 *     tags: [Rankings]
 *     summary: Get rankings by milestones achieved
 *     responses:
 *       200:
 *         description: Rankings returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankingListResponse'
 */
router.get("/milestones", getRankingByMilestones);

/**
 * @openapi
 * /api/rankings/user-leaderboard:
 *   get:
 *     tags: [Rankings]
 *     summary: Get overall user leaderboard
 *     responses:
 *       200:
 *         description: User leaderboard returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLeaderboardResponse'
 */
router.get("/user-leaderboard", getUserLeaderboard);

/**
 * @openapi
 * /api/rankings/skill-leaderboard/{skillId}:
 *   get:
 *     tags: [Rankings]
 *     summary: Get leaderboard for a specific skill
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill leaderboard returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillLeaderboardResponse'
 *       404:
 *         description: Skill not found
 */
router.get("/skill-leaderboard/:skillId", getSkillLeaderboard);

export default router;
