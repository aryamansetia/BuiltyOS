import { Router } from "express";
import { body, param } from "express-validator";

import {
  addRoute,
  createAgency,
  deleteRoute,
  getMyAgency,
  listAgencies,
  searchAgencies,
  updateRoute
} from "../controllers/agencyController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/create",
  protect,
  authorizeRoles("agency"),
  [
    body("agencyName").trim().notEmpty().withMessage("Agency name is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("contactNumber").trim().notEmpty().withMessage("Contact number is required")
  ],
  validateRequest,
  createAgency
);

router.post(
  "/route",
  protect,
  authorizeRoles("agency"),
  [
    body("from").trim().notEmpty().withMessage("Route origin is required"),
    body("to").trim().notEmpty().withMessage("Route destination is required"),
    body("basePricePerKg").isFloat({ gt: 0 }).withMessage("basePricePerKg must be greater than 0"),
    body("estimatedDays").optional().isInt({ min: 1 }).withMessage("estimatedDays must be 1 or more")
  ],
  validateRequest,
  addRoute
);

router.patch(
  "/route/:routeId",
  protect,
  authorizeRoles("agency"),
  [
    param("routeId").isMongoId().withMessage("Valid route id is required"),
    body("from").trim().notEmpty().withMessage("Route origin is required"),
    body("to").trim().notEmpty().withMessage("Route destination is required"),
    body("basePricePerKg").isFloat({ gt: 0 }).withMessage("basePricePerKg must be greater than 0"),
    body("estimatedDays").isInt({ min: 1 }).withMessage("estimatedDays must be 1 or more")
  ],
  validateRequest,
  updateRoute
);

router.delete(
  "/route/:routeId",
  protect,
  authorizeRoles("agency"),
  [param("routeId").isMongoId().withMessage("Valid route id is required")],
  validateRequest,
  deleteRoute
);

router.get("/search", searchAgencies);
router.get("/", listAgencies);
router.get("/me", protect, authorizeRoles("agency"), getMyAgency);

export default router;
