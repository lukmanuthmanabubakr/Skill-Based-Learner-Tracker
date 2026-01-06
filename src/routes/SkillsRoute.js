import express from "express"
import { createSkills } from "../controllers/skillsControllers.js"
import { protect } from "../middleware/authToken.js"

const skillsRouter = express.Router()

skillsRouter.post("/create", protect, createSkills)

export default skillsRouter