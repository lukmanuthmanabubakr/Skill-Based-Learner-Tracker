import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  createEvidence,
  getEvidenceForPractice,
  deleteEvidence,
} from "../controllers/evidenceControllers.js";

const evidenceRouter = express.Router();

evidenceRouter.post(
  "/practice/:practiceLogId/evidence",
  protect,
  createEvidence
);

evidenceRouter.get(
  "/practice/:practiceLogId/evidence",
  protect,
  getEvidenceForPractice
);

evidenceRouter.delete("/:evidenceId", protect, deleteEvidence);

export default evidenceRouter;
