import mongoose from "mongoose";

const deliveryRecordSchema = new mongoose.Schema(
  {
    deliveryNumber: {
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
    deliveredAt: {
      type: Date,
      default: Date.now
    },
    recipientName: {
      type: String,
      required: true,
      trim: true
    },
    recipientPhone: {
      type: String,
      trim: true
    },
    proofOfDelivery: {
      type: String,
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

const DeliveryRecord = mongoose.model("DeliveryRecord", deliveryRecordSchema);

export default DeliveryRecord;
