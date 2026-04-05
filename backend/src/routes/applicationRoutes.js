import { Router } from "express";
import { body, param } from "express-validator";

import {
  listOpenApplications,
  submitOpenApplication,
  updateApplicationStatus
} from "../controllers/jobController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.get("/open", protect, authorizeRoles("agency"), listOpenApplications);

router.post(
  "/open",
  protect,
  authorizeRoles("worker"),
  [
    body("applicantName").optional().trim().isLength({ min: 2 }).withMessage("applicantName must be at least 2 characters"),
    body("phone").optional().trim().isLength({ min: 8, max: 20 }).withMessage("phone must be between 8 and 20 characters"),
    body("experience").optional().trim().isLength({ max: 500 }).withMessage("experience can be up to 500 characters")
  ],
  validateRequest,
  submitOpenApplication
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("agency"),
  [
    param("id").isMongoId().withMessage("Valid application id is required"),
    body("status").isIn(["pending", "accepted", "rejected"]).withMessage("status must be pending, accepted or rejected")
  ],
  validateRequest,
  updateApplicationStatus
);

export default router;
