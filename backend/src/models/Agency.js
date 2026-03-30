import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true
    },
    to: {
      type: String,
      required: true,
      trim: true
    },
    basePricePerKg: {
      type: Number,
      required: true,
      min: 1
    },
    estimatedDays: {
      type: Number,
      default: 2,
      min: 1
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: true
  }
);

const agencySchema = new mongoose.Schema(
  {
    ownerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    agencyName: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      default: 4.2,
      min: 0,
      max: 5
    },
    routes: {
      type: [routeSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Agency = mongoose.model("Agency", agencySchema);

export default Agency;
