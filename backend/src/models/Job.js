import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["labour", "accountant", "driver"],
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    salary: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true
    }
  },
  {
    timestamps: true
  }
);

jobSchema.index({ category: 1, location: 1, createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);

export default Job;
