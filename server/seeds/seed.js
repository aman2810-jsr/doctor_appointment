/**
 * server/seeds/seed.js
 *
 * WARNING: Drops the database at MONGODB_URI.
 * Use only in development or with a test DB.
 *
 * Run:
 *   cd server
 *   export MONGODB_URI="mongodb://127.0.0.1:27017/doctor_appointment_seed"
 *   node seeds/seed.js
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ---------------------------------------------
// Load models (ESM compatible)
// Use relative path to avoid Windows path scheme issues
import modelsDefault from "../models/index.js";
const { User, Doctor, Patient, Schedule, TimeSlot, Appointment, QueueEntry } =
  modelsDefault;

// ---------------------------------------------
// MONGO URI
// ---------------------------------------------
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/doctor_appointment_seed";

// ---------------------------------------------
// Helper: generate timeslots
// ---------------------------------------------
function generateSlots(dateOnly, startHHMM, endHHMM, slotMinutes) {
  const [sH, sM] = startHHMM.split(":").map(Number);
  const [eH, eM] = endHHMM.split(":").map(Number);

  const start = new Date(dateOnly);
  start.setHours(sH, sM, 0, 0);

  const end = new Date(dateOnly);
  end.setHours(eH, eM, 0, 0);

  const slots = [];
  let cursor = new Date(start);

  while (cursor < end) {
    const st = new Date(cursor);
    const en = new Date(cursor);
    en.setMinutes(en.getMinutes() + slotMinutes);

    if (en > end) break;

    slots.push({
      startTime: st,
      endTime: en,
    });

    cursor.setMinutes(cursor.getMinutes() + slotMinutes);
  }

  return slots;
}

// ---------------------------------------------
// Ensure indexes exist
// ---------------------------------------------
async function ensureIndexes() {
  await Promise.all([
    User.init(),
    Doctor.init(),
    Patient.init(),
    Schedule.init(),
    TimeSlot.init(),
    Appointment.init(),
    QueueEntry.init(),
  ]);
}

// ---------------------------------------------
// MAIN SEED FUNCTION
// ---------------------------------------------
async function run() {
  console.log("Connecting to", MONGODB_URI);

  try {
    await mongoose.connect(MONGODB_URI);

    // DROP DB for clean seed
    await mongoose.connection.dropDatabase();
    console.log("Dropped database:", MONGODB_URI);

    await ensureIndexes();
    console.log("Ensured indexes!");

    // 1) Create USERS (Doctor & Patient)
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    const doctorUser = await User.create({
      email: "doctor1@example.test",
      password: hashedPassword,
      role: "DOCTOR",
    });

    const patientUser = await User.create({
      email: "patient1@example.test",
      password: hashedPassword,
      role: "PATIENT",
    });

    // 2) Doctor profile
    const doctor = await Doctor.create({
      userId: doctorUser._id,
      name: "Dr Alice Grey",
      specialty: "Family Medicine",
      defaultSlotLength: 30,
      bio: "Caring family medicine doctor",
    });

    // 3) Patient profile
    const patient = await Patient.create({
      userId: patientUser._id,
      name: "Bob Green",
      dateOfBirth: new Date("1985-06-15"),
      gender: "MALE",
      phoneNumber: "+15550000002",
      metadata: { seeded: true },
    });

    // 4) Create SCHEDULE (for tomorrow)
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + 1);
    scheduleDate.setHours(0, 0, 0, 0);

    const schedule = await Schedule.create({
      doctorId: doctor._id,
      date: scheduleDate,
      startTime: "09:00",
      endTime: "12:00",
      slotMinutes: doctor.defaultSlotLength,
    });

    // 5) Create TIMESLOTS
    const slotMinutes = doctor.defaultSlotLength;
    const slotData = generateSlots(
      schedule.date,
      schedule.startTime,
      schedule.endTime,
      slotMinutes
    );

    const timeSlotDocs = slotData.map((s) => ({
      scheduleId: schedule._id,
      doctorId: doctor._id,
      startTime: s.startTime,
      endTime: s.endTime,
      isBooked: false,
      appointmentId: null,
    }));

    const createdSlots = await TimeSlot.insertMany(timeSlotDocs);
    console.log(`Inserted ${createdSlots.length} timeslots`);

    // 6) Create APPOINTMENT for first slot
    const firstSlot = createdSlots[0];

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      timeSlotId: firstSlot._id,
      status: "SCHEDULED",
      notes: "Seeded appointment",
      createdAt: new Date(),
    });

    await TimeSlot.findByIdAndUpdate(firstSlot._id, {
      $set: { isBooked: true, appointmentId: appointment._id },
    });

    // 7) Create QUEUE ENTRY
    const queueEntry = await QueueEntry.create({
      patientId: patient._id,
      doctorId: doctor._id,
      status: "WAITING",
      isActive: true,
      priority: 0,
      metadata: { source: "seed" },
    });

    // -----------------------------------------
    // Summary
    // -----------------------------------------
    console.log("\n--- SEED SUCCESS SUMMARY ---");
    console.log("Doctor:", doctorUser.email);
    console.log("Patient:", patientUser.email);
    console.log("Schedule:", schedule._id.toString());
    console.log("First Slot:", firstSlot.startTime.toISOString());
    console.log("Appointment:", appointment._id.toString());
    console.log("QueueEntry:", queueEntry._id.toString());
    console.log("--- END SUMMARY ---\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("SEED ERROR:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

run();
