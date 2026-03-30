import mongoose from "mongoose";

const gpsLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },
    lr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LR"
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    speed: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      enum: ["device", "simulated"],
      default: "simulated"
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

gpsLogSchema.index({ vehicle: 1, recordedAt: -1 });

const GPSLog = mongoose.model("GPSLog", gpsLogSchema);

export default GPSLog;
