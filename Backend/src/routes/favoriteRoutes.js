import express from "express";

import {
  toggleFavorite,
  getFavorites,
} from "../controllers/favoriteController.js";

import protect from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getFavorites
);

router.put(
  "/:eventId",
  protect,
  toggleFavorite
);

export default router;