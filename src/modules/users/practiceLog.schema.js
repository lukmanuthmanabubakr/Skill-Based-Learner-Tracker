import mongoose, { Schema } from "mongoose";

const practiceSchema = new mongoose.Schema(
  {
    skill_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "Skills",
    },
    user_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    date_practiced: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Practice date cannot be in the future",
      },
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 1440,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    difficulty_rating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    confidence_rating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

const practiceModel = mongoose.model("Practice", practiceSchema);

export default practiceModel;
