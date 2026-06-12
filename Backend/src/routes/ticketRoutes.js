import express from "express";
import { downloadTicket } from "../controllers/ticketController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/download/:registrationId",
  protect,
  downloadTicket
);

export default router;