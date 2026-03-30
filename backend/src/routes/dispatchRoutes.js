import { Router } from "express";
import { body } from "express-validator";

import { createDispatch } from "../controllers/dispatchController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/create",
  protect,
  authorizeRoles("agency"),
  [
    body("lrId").isMongoId().withMessage("Valid lrId is required"),
    body("vehicleId").optional().isMongoId().withMessage("vehicleId must be a valid id"),
    body("vehicleNumber")
      .optional()
      .trim()
      .isLength({ min: 4 })
      .withMessage("vehicleNumber must have at least 4 characters"),
    body().custom((value) => {
      if (!value.vehicleId && !value.vehicleNumber) {
        throw new Error("Provide either vehicleId or vehicleNumber");
      }
      return true;
    }),
    body("initialLatitude").optional().isFloat({ min: -90, max: 90 }),
    body("initialLongitude").optional().isFloat({ min: -180, max: 180 })
  ],
  validateRequest,
  createDispatch
);

export default router;
