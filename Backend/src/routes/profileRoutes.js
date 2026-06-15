import express from "express";
import upload from "../middlewares/multer.js";
import protect from "../middlewares/auth.js";

import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/", protect, getProfile);

router.put("/", protect, updateProfile);

router.put(
  "/photo",
  protect,
  upload.single("profilePhoto"),
  uploadProfilePhoto
);

export default router;