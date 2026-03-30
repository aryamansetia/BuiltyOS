import mongoose from "mongoose";

const arrivalChallanSchema = new mongoose.Schema(
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
      ref: "Vehicle"
    },
    arrivalDate: {
      type: Date,
      default: Date.now
    },
    hubLocation: {
      type: String,
      required: true,
      trim: true
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

const ArrivalChallan = mongoose.model("ArrivalChallan", arrivalChallanSchema);

export default ArrivalChallan;
