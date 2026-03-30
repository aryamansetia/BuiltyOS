import { Router } from "express";
import { body } from "express-validator";

import { updateGPS } from "../controllers/trackingController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/update",
  protect,
  authorizeRoles("agency"),
  [
    body("vehicleId").optional().isMongoId().withMessage("vehicleId must be valid"),
    body("lrNumber").optional().trim().isLength({ min: 5 }).withMessage("lrNumber must be valid"),
    body("latitude").isFloat({ min: -90, max: 90 }).withMessage("latitude must be between -90 and 90"),
    body("longitude").isFloat({ min: -180, max: 180 }).withMessage("longitude must be between -180 and 180"),
    body().custom((value) => {
      if (!value.vehicleId && !value.lrNumber) {
        throw new Error("Provide either vehicleId or lrNumber");
      }
      return true;
    })
  ],
  validateRequest,
  updateGPS
);

export default router;
