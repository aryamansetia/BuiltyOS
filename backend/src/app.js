import cors from "cors";
import express from "express";
import morgan from "morgan";

import agencyRoutes from "./routes/agencyRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import arrivalRoutes from "./routes/arrivalRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import dispatchRoutes from "./routes/dispatchRoutes.js";
import gpsRoutes from "./routes/gpsRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import lrRoutes from "./routes/lrRoutes.js";
import loadRoutes from "./routes/loadRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "builtyos-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/agency", agencyRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/lr", lrRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/arrival", arrivalRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/gps", gpsRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/loads", loadRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
