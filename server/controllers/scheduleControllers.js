import validator from "validator";
import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";
import Schedule from "../models/Schedule.js";
import TimeSlot from "../models/TimeSlot.js";

export const createOrUpdateSchedule = async (req, res) => {
  try {
    // ✅ doctorId should come from route param or auth
    const { doctorId } = req.params;

    const {
      date,
      timezone,
      startTime,
      endTime,
      slotMinutes,
      breakPeriods = [],
      notes,
    } = req.body;

    // ---- VALIDATION ----

    if (!doctorId || !validator.isMongoId(doctorId)) {
      return res.status(400).json({ error: "Invalid doctorId" });
    }

    if (!date || !validator.isISO8601(date)) {
      return res.status(400).json({ error: "Invalid or missing date" });
    }

    if (!timezone || typeof timezone !== "string") {
      return res.status(400).json({ error: "Invalid or missing timezone" });
    }

    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return res.status(400).json({ error: "startTime must be HH:mm" });
    }

    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      return res.status(400).json({ error: "endTime must be HH:mm" });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        error: "startTime must be earlier than endTime",
      });
    }

    if (!Number.isInteger(slotMinutes) || slotMinutes <= 0) {
      return res.status(400).json({
        error: "slotMinutes must be a positive integer",
      });
    }

    if (!Array.isArray(breakPeriods)) {
      return res.status(400).json({ error: "breakPeriods must be an array" });
    }

    for (const b of breakPeriods) {
      if (
        !/^\d{2}:\d{2}$/.test(b.start) ||
        !/^\d{2}:\d{2}$/.test(b.end) ||
        b.start >= b.end
      ) {
        return res.status(400).json({
          error: "Invalid breakPeriods format or range",
        });
      }
    }

    if (notes && typeof notes !== "string") {
      return res.status(400).json({ error: "Notes must be a string" });
    }

    // Normalize date to midnight (important)
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // ---- UPSERT ----
    const schedule = await Schedule.findOneAndUpdate(
      { doctorId, date: normalizedDate },
      {
        doctorId,
        date: normalizedDate,
        timezone,
        startTime,
        endTime,
        slotMinutes,
        breakPeriods,
        notes,
      },
      { new: true, upsert: true }
    );

    return res.status(200).json(schedule);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to create or update schedule",
    });
  }
};

export const generateSlots = async (req, res) => {
  try {
    // Identify schedule
    const { scheduleId } = req.params;
    const { generationId: clientGenerationId } = req.body || {};

    const generationId = clientGenerationId || `gen_${uuidv4()}`;

    // API-level idempotency using TimeSlot.meta
    const existingSlot = await TimeSlot.findOne({
      scheduleId,
      "meta.generationId": generationId,
    });

    if (existingSlot) {
      return res.status(409).json({
        error: "Slots already generated for this generationId",
        generationId,
      });
    }

    // Load schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const {
      doctorId,
      date,
      timezone = "UTC",
      startTime,
      endTime,
      slotMinutes,
      breakPeriods = [],
    } = schedule;

    // Build day window (timezone-aware)
    const day = moment(date).format("YYYY-MM-DD");

    const windowStart = moment.tz(`${day} ${startTime}`, timezone);
    const windowEnd = moment.tz(`${day} ${endTime}`, timezone);

    if (!windowStart.isBefore(windowEnd)) {
      return res.status(400).json({
        error: "Invalid schedule time window",
      });
    }

    // Generate slots
    let cursor = windowStart.clone();
    const ops = [];

    while (cursor.isBefore(windowEnd)) {
      const slotStart = cursor.clone();
      const slotEnd = slotStart.clone().add(slotMinutes, "minutes");

      if (slotEnd.isAfter(windowEnd)) break;

      // Break overlap check (correct logic)
      const overlapsBreak = breakPeriods.some((b) => {
        const breakStart = moment.tz(`${day} ${b.start}`, timezone);
        const breakEnd = moment.tz(`${day} ${b.end}`, timezone);
        return slotStart.isBefore(breakEnd) && slotEnd.isAfter(breakStart);
      });

      if (!overlapsBreak) {
        ops.push({
          insertOne: {
            document: {
              scheduleId,
              doctorId,
              start: slotStart.toDate(), // UTC
              end: slotEnd.toDate(),     // UTC
              status: "free",
              meta: {
                generationId,
                generatedAt: new Date(),
              },
            },
          },
        });
      }

      cursor = slotEnd;
    }

    // Bulk insert (DB-level idempotency via unique index)
    let inserted = 0;
    if (ops.length > 0) {
      try {
        const result = await TimeSlot.bulkWrite(ops, {
          ordered: false,
        });
        inserted = result.insertedCount;
      } catch (err) {
        inserted = err.result?.insertedCount || 0;
      }
    }

    return res.status(201).json({
      message: "Slots generated successfully",
      scheduleId,
      generationId,
      inserted,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Slot generation failed",
      details: error.message,
    });
  }
};

export const getDoctorSchedules = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const schedules = await Schedule.find({ doctorId })
      .sort({ date: 1 });

    return res.status(200).json(schedules);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch schedules",
      details: error.message,
    });
  }
};
