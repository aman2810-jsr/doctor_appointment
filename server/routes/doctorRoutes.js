import express from "express";
import { createOrUpdateSchedule, getDoctorSchedules } from "../controllers/scheduleControllers.js";

const router = express.Router();

router.post("/doctors/:doctorId/schedules", createOrUpdateSchedule);

router.get("/doctors/:doctorId/schedules", getDoctorSchedules);

export default router;