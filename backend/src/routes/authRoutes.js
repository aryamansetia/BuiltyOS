import { Router } from "express";
import { body } from "express-validator";

import { login, me, register, sendOTP, verifyOTP } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["customer", "agency", "worker"])
      .withMessage("Role must be customer, agency or working partner"),
    body("preferredLanguage")
      .optional()
      .isIn(["en", "hi", "ta"])
      .withMessage("Language must be en, hi or ta")
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validateRequest,
  login
);

router.post(
  "/send-otp",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  sendOTP
);

router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("Valid 6-digit OTP code is required")
  ],
  validateRequest,
  verifyOTP
);

router.get("/me", protect, me);

export default router;
