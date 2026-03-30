import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    driverName: {
      type: String,
      required: true,
      trim: true
    },
    driverPhone: {
      type: String,
      trim: true
    },
    currentLocation: {
      latitude: {
        type: Number,
        default: 28.6139
      },
      longitude: {
        type: Number,
        default: 77.209
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    },
    isActive: {
      type: Boolean,
      default: false
    },
    assignedLR: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LR"
    }
  },
  {
    timestamps: true
  }
);

vehicleSchema.index({ agency: 1, vehicleNumber: 1 }, { unique: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
