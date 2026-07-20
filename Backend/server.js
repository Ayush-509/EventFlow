import express from "express";
import connectDB from "./src/config/mongodb.js";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import eventRoutes from "./src/routes/eventRoutes.js";
import statsRoutes from "./src/routes/statsRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import adminEventRoutes from "./src/routes/adminEventRoutes.js";
import registrationRoutes from "./src/routes/registrationRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import announcementRoutes from "./src/routes/announcementRoutes.js";
import favoriteRoutes from "./src/routes/favoriteRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import eventGalleryRoutes from "./src/routes/eventGalleryRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

import path from "path";

import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

const app = express();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

connectDB()

app.get("/", (req, res) => {
  res.send("EventFlow Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/gallery", eventGalleryRoutes);
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use("/api/admin", adminEventRoutes);

app.use("/api/registrations", registrationRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);


io.on("connection", (socket) => {

  console.log("User Connected:", socket.id);

  socket.on("join", (userId) => {

  console.log("JOIN DATA RECEIVED:", userId);

  if (!userId) {
    console.log("NO USER ID RECEIVED");
    return;
  }

  socket.join(String(userId));

  console.log("Joined room:", userId);

});
  socket.on("disconnect", () => {

    console.log("User Disconnected");

  });

});
const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});

