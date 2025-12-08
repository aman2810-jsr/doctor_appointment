import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true, // DB-level uniqueness for login
      lowercase: true,
      trim:true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"], // hashed password
    },
    role: {
      type: String,
      enum: ["ADMIN", "DOCTOR", "PATIENT"],
      required: [true, "Please provide a role"],
      default: "PATIENT",
    },
  },
  { timestamps: true }
);

//userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
