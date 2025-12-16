import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema(
  {
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: [true, 'Please provide schedule ID'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Please provide doctor ID'],
    },

    // store canonical UTC Date objects for fast range queries & sorting
    start: {
      type: Date,
      required: [true, 'Please provide start time'],
      index: true,
    },
    end: {
      type: Date,
      required: [true, 'Please provide end time'],
    },

    // use enum status instead of boolean isBooked for more expressiveness
    status: {
      type: String,
      enum: ['free', 'booked', 'blocked'],
      default: 'free',
      index: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
      index: true,
    },

    // flexible metadata (generationId, room, notes, createdBy, etc.)
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Unique constraint to prevent duplicate slot generation
timeSlotSchema.index({ doctorId: 1, start: 1 }, { unique: true });

// Fast queries:
// - list free slots for a doctor starting from now
timeSlotSchema.index({ doctorId: 1, status: 1, start: 1 });

// - find booked/appointment slots by doctor and date range (doctorId + start already indexed)
// - quick lookup by appointmentId for cancellation flows
timeSlotSchema.index({ appointmentId: 1 });

export default mongoose.model('TimeSlot', timeSlotSchema);
