import { Router } from "express";

import {
  signupController,
  loginController,
  getCurrentUserController,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Signup
router.post("/signup", signupController);

// Login
router.post("/login", loginController);

// Current logged-in user
router.get(
  "/me",
  authMiddleware,
  getCurrentUserController
);

export default router;