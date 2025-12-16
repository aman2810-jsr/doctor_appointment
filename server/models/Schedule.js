import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Please provide doctor ID'],
    },

    // A date that represents the day the schedule applies to (local date for doctor).
    // Keep as Date (stored at midnight UTC). If you prefer string "YYYY-MM-DD" that's also fine.
    date: {
      type: Date,
      required: [true, 'Please provide date'],
    },

    // Doctor local timezone for correct generation (e.g. "Asia/Kolkata")
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
    },

    // local time strings for the working window (HH:mm)
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
      validate: {
        validator: v => /^\d{2}:\d{2}$/.test(v),
        message: 'startTime must be in HH:mm format',
      },
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
      validate: {
        validator: v => /^\d{2}:\d{2}$/.test(v),
        message: 'endTime must be in HH:mm format',
      },
    },

    // duration of each generated slot in minutes
    slotMinutes: {
      type: Number,
      required: true,
      default: 15,
      min: [1, 'slotMinutes must be > 0'],
    },

    // optional breaks for the day, array of { start: "HH:mm", end: "HH:mm" }
    breakPeriods: [
      {
        start: { type: String },
        end: { type: String },
      },
    ],

    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Ensure one schedule per doctor per date (make unique if that's desired)
scheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export default mongoose.model("Schedule", scheduleSchema);
