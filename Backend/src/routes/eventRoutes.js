import express from "express";
import {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getOrganizerEvents,
  getOrganizerAnalytics,
  getEventAnalytics,
} from "../controllers/eventController.js";

import upload from "../middlewares/multer.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

// Public Routes
router.get("/", getEvents);

// Overall Organizer Analytics
router.get(
  "/organizer/analytics",
  protect,
  getOrganizerAnalytics
);

// Single Event Analytics
router.get(
  "/analytics/:eventId",
  protect,
  getEventAnalytics
);

// Organizer Events
router.get(
  "/organizer/my-events",
  protect,
  getMyEvents
);

router.get(
  "/organizer/:organizerId/:eventId",
  getOrganizerEvents
);

// Event Details
router.get("/:id", getEventById);

// Create Event
router.post(
  "/",
  protect,
  upload.single("poster"),
  createEvent
);

// Update Event
router.put(
  "/:id",
  protect,
  upload.single("poster"),
  updateEvent
);

// Delete Event
router.delete(
  "/:id",
  protect,
  deleteEvent
);

export default router;
