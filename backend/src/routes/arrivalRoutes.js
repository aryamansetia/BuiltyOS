import { Router } from "express";
import { body } from "express-validator";

import { createArrival } from "../controllers/arrivalController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/create",
  protect,
  authorizeRoles("agency"),
  [
    body("lrId").isMongoId().withMessage("Valid lrId is required"),
    body("hubLocation").trim().notEmpty().withMessage("hubLocation is required")
  ],
  validateRequest,
  createArrival
);

export default router;
