import express from "express";

import protect from "../middlewares/auth.js";

import {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

router.get(
  "/event/:eventId",
  getAnnouncements
);

router.post(
  "/event/:eventId",
  protect,
  createAnnouncement
);

router.delete(
  "/:id",
  protect,
  deleteAnnouncement
);

export default router;