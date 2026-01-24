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

/**
 * @openapi
 * tags:
 *   - name: Analytics
 *     description: Analytics endpoints for progress, summaries, timelines, and streaks
 */

/**
 * @openapi
 * /api/analytics/skills/{skillId}/progress:
 *   get:
 *     tags: [Analytics]
 *     summary: Get progress analytics for a specific skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill progress returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillProgressResponse'
 *       401:
 *         description: Not authorised
 */
router.get("/skills/:skillId/progress", getSkillProgress);

/**
 * @openapi
 * /api/analytics/user/summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Get summary analytics for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User summary returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSummaryResponse'
 *       401:
 *         description: Not authorised
 */
router.get("/user/summary", getUserSummary);

/**
 * @openapi
 * /api/analytics/skills/{skillId}/timeline:
 *   get:
 *     tags: [Analytics]
 *     summary: Get practice timeline for a specific skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     responses:
 *       200:
 *         description: Skill timeline returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillTimelineResponse'
 *       401:
 *         description: Not authorised
 */
router.get("/skills/:skillId/timeline", getSkillTimeline);

/**
 * @openapi
 * /api/analytics/user/streaks:
 *   get:
 *     tags: [Analytics]
 *     summary: Get streak analytics for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User streaks returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStreaksResponse'
 *       401:
 *         description: Not authorised
 */
router.get("/user/streaks", getUserStreaks);

export default router;
