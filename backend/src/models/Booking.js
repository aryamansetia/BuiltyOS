import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true
    },
    sourceCity: {
      type: String,
      required: true,
      trim: true
    },
    destinationCity: {
      type: String,
      required: true,
      trim: true
    },
    goodsDescription: {
      type: String,
      required: true,
      trim: true
    },
    weightKg: {
      type: Number,
      required: true,
      min: 1
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 1
    },
    pickupDate: {
      type: Date,
      required: true
    },
    notes: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["Booked", "Dispatched", "Arrived", "Delivered"],
      default: "Booked"
    },
    lr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LR"
    }
  },
  {
    timestamps: true
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
