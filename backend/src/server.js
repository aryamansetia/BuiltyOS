import dotenv from "dotenv";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.js";
import { startGpsSimulator, stopGpsSimulator } from "./services/gpsSimulator.js";

dotenv.config();

const port = process.env.PORT || 5000;

const bootstrap = async () => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  try {
    await connectDB();
    startGpsSimulator();
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    console.warn("Server is running, but database is disconnected. Please check MONGO_URI and Atlas IP Whitelist.");
  }

  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Gracefully shutting down...`);
    stopGpsSimulator();
    server.close(async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

bootstrap();
