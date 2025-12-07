import mongoose from "mongoose";

const queueEntrySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Please provide patient ID"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Please provide doctor ID"],
    },
    status: {
      type: String,
      enum: ["WAITING", "IN_CONSULTATION", "COMPLETED", "CANCELLED", "NO_SHOW"],
      default: "WAITING",
    },
    isActive: {
      type: Boolean,
      default: true,
    }, // mark when patient served/removed
    priority: {
      type: Number,
      default: 0,
    }, // higher -> earlier
    createdAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
queueEntrySchema.index({
  doctorId: 1,
  isActive: 1,
  priority: -1,
  createdAt: 1,
});

export default mongoose.model("QueueEntry", queueEntrySchema);
