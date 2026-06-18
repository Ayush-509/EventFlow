import express from "express";
import { getEvents,createEvent,getEventById,updateEvent,deleteEvent,getMyEvents } from "../controllers/eventController.js";
import upload from "../middlewares/multer.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/organizer/my-events", protect, getMyEvents);
router.get("/:id", getEventById);
router.post("/", protect, upload.single("poster"), createEvent);
router.put("/:id", protect, upload.single("poster"), updateEvent);

router.delete( "/:id", protect, deleteEvent);

export default router;