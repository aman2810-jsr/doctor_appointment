import express from "express";
import { generateSlots } from "../controllers/scheduleControllers";
import { getSlotsBySchedule } from "../controllers/slotControllers";

const router = express.Router();

router.post("/schedules/:scheduleId/generate-slots", generateSlots);

router.get("/schedules/:scheduleId/slots", getSlotsBySchedule);

export default router;