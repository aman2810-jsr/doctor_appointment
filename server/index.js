import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import http from "http"; 
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api", authRoutes);
app.use("/api",scheduleRoutes);
app.use("/api",doctorRoutes);
app.use("/api",slotRoutes);



app.get("/", (req, res) => {
  res.send("Backend running...");
});

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_doctor_room", ({ doctorId }) => {
    socket.join(`doctor_${doctorId}`);
    console.log(`User joined doctor room: doctor_${doctorId}`);
  });

  socket.on("disconnect", () => console.log("Socket disconnected"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
