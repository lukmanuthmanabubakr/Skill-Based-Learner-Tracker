import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  createSkills,
  getUserSkills,
  updateUserSkills,
  deleteSkill,
} from "../controllers/skillsControllers.js";

const skillsRouter = express.Router();

skillsRouter.post("/", protect, createSkills);
skillsRouter.get("/", protect, getUserSkills);
skillsRouter.patch("/:id", protect, updateUserSkills);
skillsRouter.delete("/:id", protect, deleteSkill);

export default skillsRouter;
