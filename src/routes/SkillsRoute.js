import express from "express"
import { archiveSkills, createSkills, deleteSkill, getUserSkills, multiDeleteSkill, reactivateSkills, updateUserSkills } from "../controllers/skillsControllers.js"
import { protect } from "../middleware/authToken.js"

const skillsRouter = express.Router()

skillsRouter.post("/create", protect, createSkills)
skillsRouter.get("/", protect, getUserSkills)
skillsRouter.put("/update/:skillId", protect, updateUserSkills)
skillsRouter.patch("/archive/:skillId", protect, archiveSkills)
skillsRouter.patch("/reactivate/:skillId", protect, reactivateSkills)
skillsRouter.delete("/delete-skill/:skillId", protect, deleteSkill)
skillsRouter.delete("/delete-skill", protect, multiDeleteSkill)

export default skillsRouter