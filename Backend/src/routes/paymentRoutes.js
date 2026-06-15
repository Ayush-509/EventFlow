import express from "express";
import protect from "../middlewares/auth.js";
import { createOrder } from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/create-order",
  createOrder
);

export default router;