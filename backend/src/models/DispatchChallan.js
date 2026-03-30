import mongoose from "mongoose";

const dispatchChallanSchema = new mongoose.Schema(
  {
    challanNumber: {
      type: String,
      required: true,
      unique: true
    },
    lr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LR",
      required: true,
      unique: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true
    },
    fromCity: {
      type: String,
      required: true
    },
    toCity: {
      type: String,
      required: true
    },
    dispatchDate: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const DispatchChallan = mongoose.model("DispatchChallan", dispatchChallanSchema);

export default DispatchChallan;
