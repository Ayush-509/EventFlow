import express from "express";
import protect from "../middlewares/auth.js";

import {
  registerEvent,
  getMyRegistrations,
  checkRegistration,
  getParticipants,
  exportParticipantsCSV,
} from "../controllers/registrationController.js";

const router = express.Router();

// Register for Event
router.post(
  "/:eventId/register",
  protect,
  registerEvent
);

// My Registrations
router.get(
  "/my",
  protect,
  getMyRegistrations
);

// Event Participants
router.get(
  "/:eventId/participants",
  protect,
  getParticipants
);

// Export Participants CSV
router.get(
  "/:eventId/participants.csv",
  protect,
  exportParticipantsCSV
);

// Check Registration Status
router.get(
  "/:eventId/status",
  protect,
  checkRegistration
);

export default router;
