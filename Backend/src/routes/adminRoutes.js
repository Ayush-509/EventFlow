import express from "express";
import protect from "../middlewares/auth.js";
import { authAdmin } from "../middlewares/authAdmin.js";

import {
  getCustomers,
  getOrganizers,
  toggleBlockUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.get(
  "/customers",
  protect,
  authAdmin,
  getCustomers
);

router.get(
  "/organizers",
  protect,
  authAdmin,
  getOrganizers
);

router.patch(
  "/users/:userId/block",
  protect,
  authAdmin,
  toggleBlockUser
);

export default router;