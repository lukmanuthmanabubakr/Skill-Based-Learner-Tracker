import express from "express"
import { protect } from "../middleware/authToken.js"
import { createPracticeSession } from "../controllers/practiceControllers.js"

const practiceRoute = express.Router()

practiceRoute.post('/:skillId/create', protect, createPracticeSession)

export default practiceRoute