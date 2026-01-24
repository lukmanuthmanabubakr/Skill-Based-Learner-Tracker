import express from "express";
import {
  getUser,
  loginUser,
  registerUser,
  updateUserProfile,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authToken.js";

const userRoutes = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication and profile
 */

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRoutes.post("/register", registerUser);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRoutes.post("/login", loginUser);

/**
 * @openapi
 * /api/auth/users/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Not authorised
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRoutes.get("/users/me", protect, getUser);

/**
 * @openapi
 * /api/auth/users/me:
 *   patch:
 *     tags: [Auth]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Not authorised
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRoutes.patch("/users/me", protect, updateUserProfile);

export default userRoutes;
