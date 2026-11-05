import { Router } from "express";

import {
  signup,
  login,
  getCurrentUser,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Create a new user account
router.post("/signup", signup);

// Log in an existing user
router.post("/login", login);

// Get the currently authenticated user
router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

export default router;
