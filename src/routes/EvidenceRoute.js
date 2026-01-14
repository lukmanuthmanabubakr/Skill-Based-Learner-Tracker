import express from "express";
import { protect } from "../middleware/authToken.js";
import { getEvidenceForSkill, deleteEvidence, createEvidence } from "../controllers/evidenceControllers.js";

const evidenceRouter = express.Router();

evidenceRouter.post("/", protect, createEvidence);
evidenceRouter.get("/:skillId", protect, getEvidenceForSkill);
evidenceRouter.delete("/:evidenceId", protect, deleteEvidence);

export default evidenceRouter;
