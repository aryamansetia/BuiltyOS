import { Router } from "express";

import { getTrackingByLR } from "../controllers/trackingController.js";

const router = Router();

router.get("/", getTrackingByLR);

export default router;
