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
 *     description: Manage user skills
 */

/**
 * IMPORTANT:
 * Ensure your app mounting matches these paths:
 * app.use("/api/v1/skills", skillsRouter)
 */


/**
 * @openapi
 * /api/v1/skills:
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
 *             type: object
 *             required: [name, category]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Node.js"
 *                 minLength: 3
 *                 maxLength: 50
 *               description:
 *                 type: string
 *                 example: "Building REST APIs with Express"
 *                 maxLength: 500
 *                 nullable: true
 *               category:
 *                 type: string
 *                 example: "Backend Development"
 *                 description: Must be one of the allowed categories
 *           examples:
 *             createSkill:
 *               summary: Create skill example
 *               value:
 *                 name: "Node.js"
 *                 description: "Building REST APIs with Express"
 *                 category: "Backend Development"
 *     responses:
 *       201:
 *         description: Skill created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "65b4f2c7e3c2a2f3b1234567"
 *                     user_id:
 *                       type: string
 *                       example: "65b4f2a1e3c2a2f3b7654321"
 *                     name:
 *                       type: string
 *                       example: "Node.js"
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: "Building REST APIs with Express"
 *                     category:
 *                       type: string
 *                       example: "Backend Development"
 *                     status:
 *                       type: string
 *                       example: "Active"
 *                     current_stage:
 *                       type: string
 *                       example: "Beginner"
 *                     archived_at:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       example: "2026-01-27T12:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       example: "2026-01-27T12:00:00.000Z"
 *                 meta:
 *                   type: object
 *                   example: {}
 *       401:
 *         description: Not authorised
 *       409:
 *         description: Duplicate skill name
 *       422:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
skillsRouter.post("/", protect, createSkills);


/**
 * @openapi
 * /api/v1/skills:
 *   get:
 *     tags: [Skills]
 *     summary: Get all skills for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Archived]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         description: "Format: field:asc|desc (e.g. createdAt:desc)"
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Skills list returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillsListResponse'
 *       401:
 *         description: Not authorised
 */
skillsRouter.get("/", protect, getUserSkills);

/**
 * Put static routes BEFORE param routes (safe practice)
 */

/**
 * @openapi
 * /api/v1/skills/bulk-delete:
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
 *       401:
 *         description: Not authorised
 *       404:
 *         description: No skills deleted (not found or not owned)
 */
skillsRouter.post("/bulk-delete", protect, multiDeleteSkill);

/**
 * @openapi
 * /api/v1/skills/{skillId}:
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
 *       400:
 *         description: No valid fields provided
 *       401:
 *         description: Not authorised
 *       404:
 *         description: Skill not found or access denied
 */
skillsRouter.patch("/:skillId", protect, updateUserSkills);

/**
 * @openapi
 * /api/v1/skills/{skillId}/archive:
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
 *       401:
 *         description: Not authorised
 *       404:
 *         description: Skill not found
 *       409:
 *         description: Skill already archived
 */
skillsRouter.patch("/:skillId/archive", protect, archiveSkills);

/**
 * @openapi
 * /api/v1/skills/{skillId}/reactivate:
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
 *       401:
 *         description: Not authorised
 *       404:
 *         description: Skill not found
 *       409:
 *         description: Skill already active
 */
skillsRouter.patch("/:skillId/reactivate", protect, reactivateSkills);

/**
 * @openapi
 * /api/v1/skills/{skillId}:
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
 *         description: Skill deleted successfully
 *       401:
 *         description: Not authorised
 *       404:
 *         description: Skill not found
 */
skillsRouter.delete("/:skillId", protect, deleteSkill);

export default skillsRouter;
