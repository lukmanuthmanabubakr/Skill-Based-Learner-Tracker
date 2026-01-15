import mongoose, { Schema } from "mongoose";

const EvidenceSchema = new Schema(
  {
    practice_log_id: {
      type: Schema.Types.ObjectId,
      ref: "Practice",
      required: true,
      index: true,
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
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

    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Evidence", EvidenceSchema);
