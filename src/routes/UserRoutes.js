import express from "express";
import {
  getUser,
  loginUser,
  registerUser,
} from "../controllers/userControllers.js";
import { protect } from "../middleware/authToken.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/users/me", protect, getUser);

export default userRoutes;
