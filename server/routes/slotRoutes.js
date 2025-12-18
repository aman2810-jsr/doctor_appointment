import express from "express";
import { getAvailableSlotsByDoctor } from "../controllers/slotControllers.js";

const router = express.Router();

router.get("/doctors/:doctorId/slots",getAvailableSlotsByDoctor);

export default router;
