import { Router } from "express";
import { body } from "express-validator";

import { createLR, downloadLRMock } from "../controllers/lrController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/create",
  protect,
  authorizeRoles("agency"),
  [
    body("bookingId").isMongoId().withMessage("Valid bookingId is required"),
    body("freightAmount").optional().isFloat({ gt: 0 }).withMessage("freightAmount must be greater than 0"),
    body("consignorName").trim().notEmpty().withMessage("consignorName is required"),
    body("consigneeName").trim().notEmpty().withMessage("consigneeName is required")
  ],
  validateRequest,
  createLR
);

router.get("/:lrId/pdf", protect, authorizeRoles("agency"), downloadLRMock);

export default router;
