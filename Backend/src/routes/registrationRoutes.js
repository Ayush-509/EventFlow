import express from "express";
import protect from "../middlewares/auth.js";
import {
  registerEvent,
  getMyRegistrations,checkRegistration
} from "../controllers/registrationController.js";

const router = express.Router();

router.post(
  "/:eventId/register",
  protect,
  registerEvent
);

router.get(
  "/my",
  protect,
  getMyRegistrations
);

router.get(
  "/:eventId/status",
  protect,
  checkRegistration
);

export default router;