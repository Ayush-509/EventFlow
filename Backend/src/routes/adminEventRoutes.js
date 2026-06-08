import express from "express";
import {
  getPendingEvents,
  approveEvent,
  rejectEvent,
} from "../controllers/adminEventController.js";

import { authAdmin } from "../middlewares/authAdmin.js";
import protect from "../middlewares/auth.js"; // 

const router = express.Router();

router.use(protect);
router.use(authAdmin);

// GET pending events
router.get("/events/pending", getPendingEvents);

router.post("/events/:id/approve", approveEvent);

router.post("/events/:id/reject", rejectEvent);

export default router;