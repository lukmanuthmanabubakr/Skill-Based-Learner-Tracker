import express from "express"
import { createSkills, getUserSkills } from "../controllers/skillsControllers.js"
import { protect } from "../middleware/authToken.js"

const skillsRouter = express.Router()

skillsRouter.post("/create", protect, createSkills)
skillsRouter.get("/", protect, getUserSkills)

export default skillsRouter