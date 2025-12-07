import User from "./User.js";
import Doctor from "./Doctor.js";
import Patient from "./Patient.js";
import Schedule from "./Schedule.js";
import TimeSlot from "./TimeSlot.js";
import Appointment from "./Appointment.js";
import QueueEntry from "./QueueEntry.js";

export { User, Doctor, Patient, Schedule, TimeSlot, Appointment, QueueEntry };

const models = {
  User,
  Doctor,
  Patient,
  Schedule,
  TimeSlot,
  Appointment,
  QueueEntry,
};

export default models;
