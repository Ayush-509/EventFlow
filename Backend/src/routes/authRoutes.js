import express from "express";

import {
  signup,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";

import protect from "../middlewares/auth.js";

const router = express.Router();

// AUTH ROUTES

router.post("/signup", signup);
router.post("/login", login);

// PROFILE

router.get("/profile", protect, getProfile);

// PASSWORD FLOW

// 🔐 Forgot password (send email)
router.post("/forgot-password", forgotPassword);

// 🔁 Reset password (via token)
router.post("/reset-password/:token", resetPassword);

// 🔑 Change password (logged-in user)
router.put("/change-password", protect, changePassword);


export default router;
