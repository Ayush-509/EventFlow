// routes/statsRoutes.js
import express from "express";

const router = express.Router();

router.get("/dashboard", (req, res) => {
  res.json({
    totalEvents: 0,
    totalUsers: 0
  });
});

router.get("/recommendations", (req, res) => {
  res.json([]);
});

export default router;