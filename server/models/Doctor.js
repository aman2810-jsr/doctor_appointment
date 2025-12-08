import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please link to a User"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Please provide name"],
    },
    specialty: {
      type: String,
      required: [true, "Please provide specialty"],
    },
    defaultSlotLength: {
      type: Number,
      default: 30,
    },
    bio: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

//doctorSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model("Doctor", doctorSchema);
