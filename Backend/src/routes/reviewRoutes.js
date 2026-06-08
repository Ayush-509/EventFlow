import express from "express";
import protect from "../middlewares/auth.js";

import {
  createReview,
  getReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

// Get all reviews for event
router.get("/:eventId", getReviews);

// Create review
router.post("/:eventId", protect, createReview);

export default router;