import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  createPracticeSession,
  getPracticeSession,
  updateSessionPractice,
  deletePracticeSession,
} from "../controllers/practiceControllers.js";

const practiceRoute = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Practice Logs
 *     description: Track learning and skill practice sessions
 */

/**
 * @openapi
 * /api/practice-logs/skills/{skillId}:
 *   post:
 *     tags: [Practice Logs]
 *     summary: Create a new practice session for a specific skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *         description: Skill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePracticeRequest'
 *     responses:
 *       201:
 *         description: Practice log created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PracticeResponse'
 *       400:
 *         description: Validation error
 */
practiceRoute.post("/skills/:skillId", protect, createPracticeSession);

/**
 * @openapi
 * /api/practice-logs:
 *   get:
 *     tags: [Practice Logs]
 *     summary: Get all practice logs for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All practice logs returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PracticeListResponse'
 */
practiceRoute.get("/", protect, getPracticeSession);

/**
 * @openapi
 * /api/practice-logs/{practiceId}:
 *   patch:
 *     tags: [Practice Logs]
 *     summary: Update a practice session
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: practiceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePracticeRequest'
 *     responses:
 *       200:
 *         description: Practice session updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PracticeResponse'
 */
practiceRoute.patch("/:practiceId", protect, updateSessionPractice);

/**
 * @openapi
 * /api/practice-logs/{practiceId}:
 *   delete:
 *     tags: [Practice Logs]
 *     summary: Delete a practice session
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: practiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Practice session deleted
 *       404:
 *         description: Practice log not found
 */
practiceRoute.delete("/:practiceId", protect, deletePracticeSession);

export default practiceRoute;
