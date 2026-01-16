import express from "express";
import { protect } from "../middleware/authToken.js";
import {
  createEvidence,
  getEvidenceForPractice,
  deleteEvidence,
} from "../controllers/evidenceControllers.js";

const evidenceRouter = express.Router();

evidenceRouter.post("/", protect, createEvidence);
evidenceRouter.get("/skills/:id/evidence", protect, getEvidenceForPractice);
evidenceRouter.delete("/:id", protect, deleteEvidence);

export default evidenceRouter;
