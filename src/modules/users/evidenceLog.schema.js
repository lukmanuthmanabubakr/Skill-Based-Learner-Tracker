import mongoose, { Schema } from "mongoose";

const EvidenceSchema = new mongoose.Schema(
  {
    practice_log_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: "Practice",
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      enum: ["file", "link", "note"],
      required: true,
    },
    uri: {
      type: String,
      required: function () {
        return this.type === "file" || this.type === "link";
      },
    },
    note: {
      type: String,
      required: function () {
        return this.type === "note";
      },
    },
    metadata: { type: Object },
  },
  { timestamps: true }
);

EvidenceSchema.pre("validate", function (next) {
  if (this.type === "note" && !this.note) {
    return next(new Error("Text is required for note type"));
  }

  if ((this.type === "file" || this.type === "link") && !this.uri) {
    return next(new Error("URL is required for file or link type"));
  }

  next();
});

const evidenceModel = mongoose.model("Evidence", EvidenceSchema);

export default evidenceModel;
