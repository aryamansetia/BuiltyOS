import mongoose from "mongoose";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting reconnection...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected successfully.");
  });

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
  });
  console.log("MongoDB connected successfully");
};

export default connectDB;
