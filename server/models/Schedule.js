import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Please provide doctor ID"],
    },
    date: {
      type: Date,
      required: [true, "Please provide date"],
    },
    startTime: {
      type: String, // HH:mm format
      required: [true, "Please provide start time"],
    },
    endTime: {
      type: String, // HH:mm format
      required: [true, "Please provide end time"],
    },
    slotMinutes: {
      type: Number,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index to ensure no duplicate schedules for same doctor on same day
scheduleSchema.index({ doctorId: 1, date: 1 });

export default mongoose.model("Schedule", scheduleSchema);
