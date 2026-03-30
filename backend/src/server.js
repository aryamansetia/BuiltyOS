import dotenv from "dotenv";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.js";
import { startGpsSimulator, stopGpsSimulator } from "./services/gpsSimulator.js";

dotenv.config();

const port = process.env.PORT || 5000;

const bootstrap = async () => {
  await connectDB();

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  startGpsSimulator();

  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Gracefully shutting down...`);
    stopGpsSimulator();
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

bootstrap().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
