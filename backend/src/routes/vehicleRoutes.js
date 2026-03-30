import { Router } from "express";
import { body } from "express-validator";

import { createVehicle, listVehicles } from "../controllers/vehicleController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/create",
  protect,
  authorizeRoles("agency"),
  [
    body("vehicleNumber").trim().notEmpty().withMessage("vehicleNumber is required"),
    body("driverName").trim().notEmpty().withMessage("driverName is required"),
    body("latitude").optional().isFloat({ min: -90, max: 90 }),
    body("longitude").optional().isFloat({ min: -180, max: 180 })
  ],
  validateRequest,
  createVehicle
);

router.get("/", protect, authorizeRoles("agency"), listVehicles);

export default router;
