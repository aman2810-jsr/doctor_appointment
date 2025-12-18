import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Schedule from "../models/Schedule.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data (order matters)
    await Schedule.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await User.deleteMany();

    console.log("Cleared existing data");

    // ========== SEED USERS ==========
    const users = [
      {
        email: "admin@hospital.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
      },
      {
        email: "doctor1@hospital.com",
        password: await bcrypt.hash("doctor123", 10),
        role: "DOCTOR",
      },
      {
        email: "doctor2@hospital.com",
        password: await bcrypt.hash("doctor123", 10),
        role: "DOCTOR",
      },
      {
        email: "patient1@example.com",
        password: await bcrypt.hash("patient123", 10),
        role: "PATIENT",
      },
      {
        email: "patient2@example.com",
        password: await bcrypt.hash("patient123", 10),
        role: "PATIENT",
      },
      {
        email: "patient3@example.com",
        password: await bcrypt.hash("patient123", 10),
        role: "PATIENT",
      },
    ];

    const insertedUsers = await User.insertMany(users);
    console.log(`✅ Seeded ${insertedUsers.length} users`);

    // ========== SEED DOCTORS ==========
    const doctors = [
      {
        userId: insertedUsers[1]._id,
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        defaultSlotLength: 30,
        bio: "Experienced cardiologist with 15 years of practice",
      },
      {
        userId: insertedUsers[2]._id,
        name: "Dr. Michael Chen",
        specialty: "Pediatrics",
        defaultSlotLength: 20,
        bio: "Specialist in child healthcare",
      },
    ];

    const insertedDoctors = await Doctor.insertMany(doctors);
    console.log(`✅ Seeded ${insertedDoctors.length} doctors`);

    // ========== SEED PATIENTS ==========
    const patients = [
      {
        userId: insertedUsers[3]._id,
        name: "John Doe",
        dateOfBirth: new Date("1985-05-15T00:00:00Z"),
        gender: "MALE",
        phoneNumber: "+1234567890",
      },
      {
        userId: insertedUsers[4]._id,
        name: "Jane Smith",
        dateOfBirth: new Date("1990-08-22T00:00:00Z"),
        gender: "FEMALE",
        phoneNumber: "+1234567891",
      },
      {
        userId: insertedUsers[5]._id,
        name: "Bob Wilson",
        dateOfBirth: new Date("1978-12-10T00:00:00Z"),
        gender: "MALE",
        phoneNumber: "+1234567892",
      },
    ];

    const insertedPatients = await Patient.insertMany(patients);
    console.log(`✅ Seeded ${insertedPatients.length} patients`);

    // ========== SEED SCHEDULES ==========
    const schedules = [
      {
        doctorId: insertedDoctors[0]._id,
        date: new Date("2025-12-20T00:00:00Z"),
        timezone: "UTC",
        startTime: "09:00",
        endTime: "17:00",
        slotMinutes: 30,
        breakPeriods: [
          { start: "12:00", end: "13:00" },
          { start: "15:00", end: "15:15" },
        ],
        notes: "Regular Friday schedule",
      },
      {
        doctorId: insertedDoctors[0]._id,
        date: new Date("2025-12-21T00:00:00Z"),
        timezone: "UTC",
        startTime: "10:00",
        endTime: "14:00",
        slotMinutes: 30,
        breakPeriods: [],
        notes: "Saturday morning schedule",
      },
      {
        doctorId: insertedDoctors[1]._id,
        date: new Date("2025-12-20T00:00:00Z"),
        timezone: "UTC",
        startTime: "08:00",
        endTime: "16:00",
        slotMinutes: 20,
        breakPeriods: [
          { start: "12:00", end: "12:30" },
        ],
        notes: "Pediatric consultation day",
      },
    ];

    const insertedSchedules = await Schedule.insertMany(schedules);
    console.log(`✅ Seeded ${insertedSchedules.length} schedules`);

    // ========== FINAL LOGS ==========
    console.log("\n🎉 Database seeding completed successfully!\n");

    console.log("Test Credentials:");
    console.log("==================");
    console.log("Admin: admin@hospital.com / admin123");
    console.log("Doctor 1: doctor1@hospital.com / doctor123");
    console.log("Doctor 2: doctor2@hospital.com / doctor123");
    console.log("Patient 1: patient1@example.com / patient123");
    console.log("Patient 2: patient2@example.com / patient123");
    console.log("Patient 3: patient3@example.com / patient123");

    console.log("\nDoctor IDs:");
    console.log("==================");
    console.log(`Doctor 1 (Cardiology): ${insertedDoctors[0]._id}`);
    console.log(`Doctor 2 (Pediatrics): ${insertedDoctors[1]._id}`);

    console.log("\nSchedule IDs:");
    console.log("==================");
    insertedSchedules.forEach((s, i) => {
      console.log(`Schedule ${i + 1}: ${s._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
