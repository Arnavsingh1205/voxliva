import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  checkAiTestLimit
} from "../middleware/usageMiddleware.js";

import {
  startAiTest,
  evaluateAiTest
} from "../controllers/aiTestController.js";

const router = Router();


// ------------------------------------
// START TEST
// ------------------------------------
router.post(
  "/start",
  authMiddleware,
  checkAiTestLimit,
  startAiTest
);


// ------------------------------------
// EVALUATE TEST
// ------------------------------------
router.post(
  "/evaluate",
  authMiddleware,
  evaluateAiTest
);


export default router;