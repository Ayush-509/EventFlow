import express from "express";
import {
  uploadMedia,
  getEventGallery,
} from "../controllers/eventGalleryController.js";

import protect from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Anyone logged in can upload
router.post(
  "/:eventId",
  protect,
  upload.single("media"),
  uploadMedia
);

// Public gallery
router.get(
  "/:eventId",
  getEventGallery
);

export default router;
