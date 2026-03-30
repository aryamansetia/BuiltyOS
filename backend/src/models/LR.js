import mongoose from "mongoose";

const lrSchema = new mongoose.Schema(
  {
    lrNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle"
    },
    freightAmount: {
      type: Number,
      required: true,
      min: 1
    },
    consignorName: {
      type: String,
      required: true,
      trim: true
    },
    consigneeName: {
      type: String,
      required: true,
      trim: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["Booked", "Dispatched", "Arrived", "Delivered"],
      default: "Booked"
    }
  },
  {
    timestamps: true
  }
);

const LR = mongoose.model("LR", lrSchema);

export default LR;
