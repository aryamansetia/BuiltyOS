import { Router } from "express";
import { body, param, query } from "express-validator";

import {
  applyToJob,
  createJob,
  getJobApplications,
  listJobs
} from "../controllers/jobController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/",
  protect,
  authorizeRoles("agency"),
  [
    body("title").trim().notEmpty().withMessage("title is required"),
    body("category")
      .isIn(["labour", "accountant", "driver"])
      .withMessage("category must be labour, accountant or driver"),
    body("location").trim().notEmpty().withMessage("location is required"),
    body("salary").isFloat({ min: 0 }).withMessage("salary must be 0 or more"),
    body("description").trim().isLength({ min: 10 }).withMessage("description must be at least 10 characters")
  ],
  validateRequest,
  createJob
);

router.get(
  "/",
  protect,
  [
    query("category")
      .optional()
      .isIn(["labour", "accountant", "driver"])
      .withMessage("category must be labour, accountant or driver")
  ],
  validateRequest,
  listJobs
);

router.post(
  "/:id/apply",
  protect,
  authorizeRoles("worker"),
  [
    param("id").isMongoId().withMessage("Valid job id is required"),
    body("applicantName").optional().trim().isLength({ min: 2 }).withMessage("applicantName must be at least 2 characters"),
    body("phone").optional().trim().isLength({ min: 8, max: 20 }).withMessage("phone must be between 8 and 20 characters"),
    body("experience").optional().trim().isLength({ max: 500 }).withMessage("experience can be up to 500 characters")
  ],
  validateRequest,
  applyToJob
);

router.get(
  "/:id/applications",
  protect,
  authorizeRoles("agency"),
  [param("id").isMongoId().withMessage("Valid job id is required")],
  validateRequest,
  getJobApplications
);

export default router;
