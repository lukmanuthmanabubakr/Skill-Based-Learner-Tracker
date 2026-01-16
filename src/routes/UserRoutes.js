import express from "express";
import {
  getUser,
  loginUser,
  registerUser,
  updateUserProfile,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authToken.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/users/me", protect, getUser);
userRoutes.patch("/users/me", protect, updateUserProfile);

export default userRoutes;
