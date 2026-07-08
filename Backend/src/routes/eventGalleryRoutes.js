import express from "express";
import {
  uploadMedia,
  getEventGallery,
  deleteMedia,
} from "../controllers/eventGalleryController.js";

import protect from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

/*
Event Gallery Routes
*/

// Public - View gallery of an event
router.get(
  "/:eventId",
  getEventGallery
);

// Logged-in users - Upload image/video
router.post(
  "/:eventId",
  protect,
  upload.single("media"),
  uploadMedia
);

// Uploader/Admin - Delete media
router.delete(
  "/media/:id",
  protect,
  deleteMedia
);

export default router;
