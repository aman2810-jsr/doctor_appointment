import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please link to a User"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Please provide first name"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please provide date of birth"],
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide phone number"],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

patientSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model("Patient", patientSchema);
