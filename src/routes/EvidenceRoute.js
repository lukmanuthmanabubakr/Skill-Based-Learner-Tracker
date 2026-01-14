import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  getEvidenceForSkill,
  deleteEvidence,
  createEvidenceForSkill,
  createEvidenceForPractice,
} from "../controllers/evidenceControllers.js";

const evidenceRouter = express.Router();

evidenceRouter.post("/skills/:skillId/evidence", protect, createEvidenceForSkill);
evidenceRouter.post(
  "/practice-logs/:practiceLogId/evidence",
  protect,
  createEvidenceForPractice
);
evidenceRouter.get("/:skillId", protect, getEvidenceForSkill);
evidenceRouter.delete("/:evidenceId", protect, deleteEvidence);

export default evidenceRouter;
