import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { bookAppointment } from "../controllers/appointmentControllers.js";

const router = express.Router();

router.use(protect);
router.use(requireRole("PATIENT"));

router.post("/appointments/book", bookAppointment);

export default router;



