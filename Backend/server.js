import express from "express";
import connectDB from "./src/config/mongodb.js";
import dotenv from "dotenv";
import cors from "cors";
import eventRoutes from "./src/routes/eventRoutes.js";
import statsRoutes from "./src/routes/statsRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import adminEventRoutes from "./src/routes/adminEventRoutes.js";
import registrationRoutes from "./src/routes/registrationRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import announcementRoutes from "./src/routes/announcementRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";


import path from "path";

import authRoutes from "./src/routes/authRoutes.js";

dotenv.config();

const app = express();
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

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});