import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please fill a valid email address"],
    },
    avatar_url: {
      type: String,
      required: false,
    },
    bio: {
      type: String,
      required: false,
    },
    last_active_at: {
      type: Date,
      required: false,
    },
    preferences: {
      timezone: {
        type: String,
        required: true,
        default: "Africa/Lagos",
      },
      week_start: {
        type: String,
        required: true,
        enum: ["Monday", "Sunday"],
        default: "Monday",
      },
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.model("User", UserSchema);

export default userModel;
