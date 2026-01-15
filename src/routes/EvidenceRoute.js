import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  getEvidenceForPractice,
  deleteEvidence,
  createEvidence,
} from "../controllers/evidenceControllers.js";

const evidenceRouter = express.Router();


evidenceRouter.post(
  "/practice-logs/:practiceLogId/evidence",
  protect,
  createEvidence
);
evidenceRouter.get("/skills/:skillId/evidence", protect, getEvidenceForPractice);

evidenceRouter.delete("/evidence/:evidenceId", protect, deleteEvidence);

export default evidenceRouter;
