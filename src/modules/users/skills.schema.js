import mongoose, { Schema } from "mongoose";
import { SKILL_CATEGORIES } from "../../constants/skillCategories.js";

const SkillsSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
      enum: SKILL_CATEGORIES
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Archived"],
    },
    current_stage: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    archived_at: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

const skillsModel = mongoose.model("Skills", SkillsSchema);

export default skillsModel;
