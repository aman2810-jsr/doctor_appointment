import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: [true, "Please provide schedule ID"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Please provide doctor ID"],
    },
    startTime: {
      type: Date,
      required: [true, "Please provide start time"],
    },
    endTime: {
      type: Date,
      required: [true, "Please provide end time"],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
timeSlotSchema.index({ doctorId: 1, startTime: 1 }, { unique: true });
timeSlotSchema.index({ doctorId: 1, isBooked: 1, startTime: 1 });

export default mongoose.model("TimeSlot", timeSlotSchema);
