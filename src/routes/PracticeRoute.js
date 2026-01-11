import express from "express"
import { protect } from "../middleware/authToken.js"
import { createPracticeSession, getPracticeSession } from "../controllers/practiceControllers.js"

const practiceRoute = express.Router()

practiceRoute.post('/:skillId/create', protect, createPracticeSession)
practiceRoute.get('/', protect, getPracticeSession)

export default practiceRoute