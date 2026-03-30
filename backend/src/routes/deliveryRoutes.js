import { Router } from "express";
import { body } from "express-validator";

import { createDelivery } from "../controllers/deliveryController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/create",
  protect,
  authorizeRoles("agency"),
  [
    body("lrId").isMongoId().withMessage("Valid lrId is required"),
    body("recipientName").trim().notEmpty().withMessage("recipientName is required")
  ],
  validateRequest,
  createDelivery
);

export default router;
