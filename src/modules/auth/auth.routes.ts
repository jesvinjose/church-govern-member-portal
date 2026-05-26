import { Router } from "express";

import {
  registerUser, loginUser, getCurrentUser, forgotPassword, resetPassword, sendOtp,
  loginWithOtp
} from "./auth.controller";

import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

router.post(
  "/send-otp",
  sendOtp
);

router.post(
  "/login-with-otp",
  loginWithOtp
);

export default router;