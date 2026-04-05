import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    applicantName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    experience: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

jobApplicationSchema.index({ job: 1, status: 1, createdAt: -1 });
jobApplicationSchema.index(
  { job: 1, applicant: 1 },
  {
    unique: true,
    partialFilterExpression: {
      applicant: {
        $exists: true,
        $type: "objectId"
      }
    }
  }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
