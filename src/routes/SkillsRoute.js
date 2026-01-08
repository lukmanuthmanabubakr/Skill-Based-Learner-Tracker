import express from "express"
import { createSkills, getUserSkills, updateUserSkills } from "../controllers/skillsControllers.js"
import { protect } from "../middleware/authToken.js"

const skillsRouter = express.Router()

skillsRouter.post("/create", protect, createSkills)
skillsRouter.get("/", protect, getUserSkills)
skillsRouter.put("/update", protect, updateUserSkills)

export default skillsRouter