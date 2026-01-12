import express from "express"
import { protect } from "../middleware/authToken.js"
import { createPracticeSession, deletePracticeSession, getPracticeSession, updateSessionPractice } from "../controllers/practiceControllers.js"

const practiceRoute = express.Router()

practiceRoute.post('/:skillId/create', protect, createPracticeSession)
practiceRoute.get('/', protect, getPracticeSession)
practiceRoute.patch("/update/:practiceId", protect, updateSessionPractice)
practiceRoute.delete(
  "/:practiceId",
  protect,
  deletePracticeSession
);


export default practiceRoute