import { Router } from "express";
import { body } from "express-validator";

import {
  createBooking,
  getAgencyBookings,
  getAgencyStats,
  getUserBookings
} from "../controllers/bookingController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/create",
  protect,
  authorizeRoles("customer"),
  [
    body("agencyId").isMongoId().withMessage("Valid agencyId is required"),
    body("sourceCity").trim().notEmpty().withMessage("sourceCity is required"),
    body("destinationCity").trim().notEmpty().withMessage("destinationCity is required"),
    body("goodsDescription").trim().notEmpty().withMessage("goodsDescription is required"),
    body("weightKg").isFloat({ gt: 0 }).withMessage("weightKg must be greater than 0"),
    body("pickupDate").isISO8601().withMessage("pickupDate must be a valid date")
  ],
  validateRequest,
  createBooking
);

router.get("/user", protect, authorizeRoles("customer"), getUserBookings);
router.get("/agency", protect, authorizeRoles("agency"), getAgencyBookings);
router.get("/agency/stats", protect, authorizeRoles("agency"), getAgencyStats);

export default router;
