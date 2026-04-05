import { Router } from "express";
import { body, param, query } from "express-validator";

import {
  applyToLoad,
  assignLoad,
  createLoad,
  getLoadById,
  listLoads
} from "../controllers/loadController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/",
  protect,
  authorizeRoles("agency"),
  [
    body("origin").trim().notEmpty().withMessage("origin is required"),
    body("destination").trim().notEmpty().withMessage("destination is required"),
    body("price").isFloat({ min: 0 }).withMessage("price must be 0 or more"),
    body("weight").isFloat({ gt: 0 }).withMessage("weight must be greater than 0"),
    body("vehicleType").trim().notEmpty().withMessage("vehicleType is required"),
    body("linkedBooking").optional().isMongoId().withMessage("linkedBooking must be a valid id")
  ],
  validateRequest,
  createLoad
);

router.get(
  "/",
  protect,
  [
    query("minPrice").optional().isFloat({ min: 0 }).withMessage("minPrice must be 0 or more"),
    query("maxPrice").optional().isFloat({ min: 0 }).withMessage("maxPrice must be 0 or more"),
    query("status")
      .optional()
      .isIn(["open", "assigned", "completed"])
      .withMessage("status must be open, assigned or completed")
  ],
  validateRequest,
  listLoads
);

router.get("/:id", protect, [param("id").isMongoId().withMessage("Valid load id is required")], validateRequest, getLoadById);

router.post(
  "/:id/apply",
  protect,
  authorizeRoles("worker"),
  [param("id").isMongoId().withMessage("Valid load id is required")],
  validateRequest,
  applyToLoad
);

router.post(
  "/:id/assign",
  protect,
  authorizeRoles("agency"),
  [
    param("id").isMongoId().withMessage("Valid load id is required"),
    body("driverId").isMongoId().withMessage("Valid driverId is required")
  ],
  validateRequest,
  assignLoad
);

export default router;
