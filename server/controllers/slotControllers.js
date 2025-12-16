import TimeSlot from "../models/TimeSlot.js";
import moment from "moment";

export const getSlotsBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const slots = await TimeSlot.find({ scheduleId })
      .sort({ start: 1 });

    return res.status(200).json(slots);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch slots",
      details: error.message,
    });
  }
};

export const getAvailableSlotsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const query = {
      doctorId,
      status: "free",
    };

    // Optional date filter
    if (date) {
      const startOfDay = moment(date).startOf("day").toDate();
      const endOfDay = moment(date).endOf("day").toDate();

      query.start = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const slots = await TimeSlot.find(query)
      .sort({ start: 1 });

    return res.status(200).json(slots);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch available slots",
      details: error.message,
    });
  }
};
