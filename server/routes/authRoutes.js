import express from "express";
import { register, login } from "../controllers/authControllers.js";

const router = express.Router();

// Register route
router.post("/auth/register", register);

// Login route
router.post("/auth/login", login);

export default router;
