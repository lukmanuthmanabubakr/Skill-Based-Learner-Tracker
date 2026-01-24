import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  createEvidence,
  getEvidenceForPractice,
  deleteEvidence,
} from "../controllers/evidenceControllers.js";

const evidenceRouter = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Evidence
 *     description: Evidence (proof) attached to practice sessions
 */

/**
 * @openapi
 * /api/evidence/practice/{practiceLogId}/evidence:
 *   post:
 *     tags: [Evidence]
 *     summary: Add evidence to a practice log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: practiceLogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Practice log ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEvidenceRequest'
 *     responses:
 *       201:
 *         description: Evidence created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EvidenceResponse'
 *       400:
 *         description: Validation error
 */
evidenceRouter.post("/practice/:practiceLogId/evidence", protect, createEvidence);

/**
 * @openapi
 * /api/evidence/practice/{practiceLogId}/evidence:
 *   get:
 *     tags: [Evidence]
 *     summary: Get evidence for a practice log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: practiceLogId
 *         required: true
 *         schema:
 *           type: string
 *         description: Practice log ID
 *     responses:
 *       200:
 *         description: Evidence list returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EvidenceListResponse'
 *       404:
 *         description: Practice log not found
 */
evidenceRouter.get("/practice/:practiceLogId/evidence", protect, getEvidenceForPractice);

/**
 * @openapi
 * /api/evidence/{evidenceId}:
 *   delete:
 *     tags: [Evidence]
 *     summary: Delete a specific evidence item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: evidenceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Evidence ID
 *     responses:
 *       200:
 *         description: Evidence deleted
 *       404:
 *         description: Evidence not found
 */
evidenceRouter.delete("/:evidenceId", protect, deleteEvidence);

export default evidenceRouter;
