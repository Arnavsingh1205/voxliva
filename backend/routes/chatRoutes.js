import { Router } from "express";

import chatController from "../controllers/chatController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  startAiSession,
  checkAiSession,
} from "../middleware/usageMiddleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| AI Chat Usage Gate
|--------------------------------------------------------------------------
*/

async function chatUsageGate(
  req,
  res,
  next
) {
  const mode =
    String(
      req.body?.mode || ""
    ).trim();

  /*
  |--------------------------------------------------------------------------
  | Grammar Teacher & Hindi → English
  |
  | These modes are kept outside the conversation-session
  | limit so the existing features continue working.
  |--------------------------------------------------------------------------
  */

  if (
    mode === "Grammar Teaching" ||
    mode === "Hindi to English"
  ) {
    return next();
  }

  /*
  |--------------------------------------------------------------------------
  | Start New Conversation
  |--------------------------------------------------------------------------
  */

  if (req.body?.start === true) {
    return startAiSession(
      req,
      res,
      next
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Continue Existing Conversation
  |--------------------------------------------------------------------------
  */

  return checkAiSession(
    req,
    res,
    next
  );
}

/*
|--------------------------------------------------------------------------
| Chat Route
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  chatUsageGate,
  chatController
);

export default router;