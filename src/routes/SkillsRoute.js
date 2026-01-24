import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  createSkills,
  getUserSkills,
  updateUserSkills,
  deleteSkill,
  archiveSkills,
  reactivateSkills,
  multiDeleteSkill,
} from "../controllers/skillsControllers.js";

const skillsRouter = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Skills
 *     description: Manage user skills
 */

/**
 * @openapi
 * /api/skills:
 *   post:
 *     tags: [Skills]
 *     summary: Create a new skill for the current user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSkillRequest'
 *     responses:
 *       201:
 *         description: Skill created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
skillsRouter.post("/", protect, createSkills);

/**
 * @openapi
 * /api/skills:
 *   get:
 *     tags: [Skills]
 *     summary: Get all skills for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skills list returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillsListResponse'
 *       401:
 *         description: Not authorised
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
skillsRouter.get("/", protect, getUserSkills);

/**
 * @openapi
 * /api/skills/{skillId}:
 *   patch:
 *     tags: [Skills]
 *     summary: Update a skill
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
 *             $ref: '#/components/schemas/UpdateSkillRequest'
 *     responses:
 *       200:
 *         description: Skill updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillResponse'
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
skillsRouter.patch("/:skillId", protect, updateUserSkills);

/**
 * @openapi
 * /api/skills/{skillId}/archive:
 *   patch:
 *     tags: [Skills]
 *     summary: Archive a skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillResponse'
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
skillsRouter.patch("/:skillId/archive", protect, archiveSkills);

/**
 * @openapi
 * /api/skills/{skillId}/reactivate:
 *   patch:
 *     tags: [Skills]
 *     summary: Reactivate an archived skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill reactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillResponse'
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
skillsRouter.patch("/:skillId/reactivate", protect, reactivateSkills);

/**
 * @openapi
 * /api/skills/{skillId}:
 *   delete:
 *     tags: [Skills]
 *     summary: Delete a skill
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillResponse'
 *       404:
 *         description: Skill not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
skillsRouter.delete("/:skillId", protect, deleteSkill);

/**
 * @openapi
 * /api/skills/bulk-delete:
 *   post:
 *     tags: [Skills]
 *     summary: Delete multiple skills at once
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkDeleteRequest'
 *     responses:
 *       200:
 *         description: Bulk delete completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkDeleteResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
skillsRouter.post("/bulk-delete", protect, multiDeleteSkill);

export default skillsRouter;
