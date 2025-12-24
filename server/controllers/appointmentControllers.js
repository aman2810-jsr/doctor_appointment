import TimeSlot from "../models/TimeSlot.js";
import Appointment from "../models/Appointment.js";

export const bookAppointment = async (req, res) => {
  const { timeSlotId } = req.body;
  const patientId = req.user._id;

  if (!timeSlotId) {
    return res.status(400).json({ success: false, message: "Missing timeSlotId" });
  }
  if (!patientId) {
    return res.status(400).json({ success: false, message: "Missing patientId" });
  }

  const session = await Appointment.startSession();

  try {
    await session.startTransaction();

    // Atomically find and update slot
    const slot = await TimeSlot.findOneAndUpdate(
      { _id: timeSlotId, status: "free" },
      { $set: { status: "booked" } },
      { new: true, session }
    );
    if (!slot) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({
          success: false,
          message: "Time slot already booked",
        });
    }

    // Create appointment inside transaction
    const appointment = await Appointment.create(
      [
        {
          patientId,
          doctorId: slot.doctorId,
          timeSlotId: slot._id,
        },
      ],
      { session }
    );

    // Update slot with appointmentId
    slot.appointmentId = appointment[0]._id;
    await slot.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: appointment[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error booking appointment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
