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

skillsRouter.post("/", protect, createSkills);
skillsRouter.get("/", protect, getUserSkills);
skillsRouter.patch("/:skillId", protect, updateUserSkills);
skillsRouter.patch("/:skillId/archive", protect, archiveSkills);
skillsRouter.patch("/:skillId/reactivate", protect, reactivateSkills);
skillsRouter.delete("/:skillId", protect, deleteSkill);
skillsRouter.post("/bulk-delete", protect, multiDeleteSkill);



export default skillsRouter;
