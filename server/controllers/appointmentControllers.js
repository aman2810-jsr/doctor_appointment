import TimeSlot from "../models/TimeSlot.js";
import Appointment from "../models/Appointment.js";


export const bookAppointment = async (req, res) => {
  const { timeSlotId } = req.body;
  const patientId = req.user._id;
  try {
    if (!timeSlotId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing timeSlotId" });
    }
    if (!patientId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing patientId in user context" });
    }

    // Fetch slot from DB
    const slot = await TimeSlot.findById(timeSlotId);
    if (!slot) {
      return res
        .status(404)
        .json({ success: false, message: "Time slot not found" });
    }
    if (slot.status === "booked") {
      return res
        .status(400)
        .json({ success: false, message: "Time slot already booked" });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId: slot.doctorId,
      timeSlotId: slot._id,
    });

    // Mark slot as booked
    slot.status = "booked";
    slot.appointmentId = appointment._id;
    await slot.save();

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
