import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getUsageController,
} from "../middleware/usageMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getUsageController
);

export default router;