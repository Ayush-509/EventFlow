import express from "express";
import { getEvents,createEvent,getEventById,updateEvent,deleteEvent } from "../controllers/eventController.js";
import upload from "../middlewares/multer.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", protect, upload.single("poster"), createEvent);
router.put( "/:id", protect, updateEvent);

router.delete( "/:id", protect, deleteEvent);

export default router;