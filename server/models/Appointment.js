import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimeSlot",
      required: [true, "Please provide time slot ID"],
      unique: true, // database-level guarantee: one appointment per timeslot
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"],
      default: "SCHEDULED",
    },
    notes: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
appointmentSchema.index({ doctorId: 1, createdAt: 1 });
//appointmentSchema.index({ timeSlotId: 1 }, { unique: true });

export default mongoose.model("Appointment", appointmentSchema);
