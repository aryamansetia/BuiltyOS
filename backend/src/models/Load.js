import mongoose from "mongoose";

const loadSchema = new mongoose.Schema(
  {
    origin: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    weight: {
      type: Number,
      required: true,
      min: 0
    },
    vehicleType: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["open", "assigned", "completed"],
      default: "open"
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    applicants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ],
      default: []
    },
    linkedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking"
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

loadSchema.index({ status: 1, origin: 1, destination: 1, vehicleType: 1, createdAt: -1 });

const Load = mongoose.model("Load", loadSchema);

export default Load;
