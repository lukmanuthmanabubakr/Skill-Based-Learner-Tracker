import mongoose, { Schema } from "mongoose";

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
      enum: [
        "Frontend Development",
        "Backend Development",
        "Database",
        "DevOps",
        "Design",
        "Language Learning",
        "Business Skills",
        "Creative Arts",
        "Other",
      ],
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
