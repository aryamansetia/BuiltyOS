import Agency from "../models/Agency.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const jobPopulateConfig = {
  path: "postedBy",
  select: "agencyName city contactNumber rating"
};

const buildJobFilters = (query) => {
  const filters = {};

  if (query.category && ["labour", "accountant", "driver"].includes(query.category)) {
    filters.category = query.category;
  }

  if (query.location) {
    filters.location = { $regex: new RegExp(query.location, "i") };
  }

  if (query.search) {
    const regex = new RegExp(query.search, "i");
    filters.$or = [{ title: regex }, { description: regex }, { location: regex }];
  }

  return filters;
};

const openApplicationFilter = {
  $or: [{ job: { $exists: false } }, { job: null }]
};

export const createJob = asyncHandler(async (req, res) => {
  const { title, category, location, salary, description } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const job = await Job.create({
    title,
    category,
    location,
    salary,
    description,
    postedBy: agency._id
  });

  const populatedJob = await Job.findById(job._id).populate(jobPopulateConfig);

  return res.status(201).json({
    message: "Job posted successfully",
    job: populatedJob
  });
});

export const listJobs = asyncHandler(async (req, res) => {
  const filters = buildJobFilters(req.query);

  if (req.query.mine === "true" && req.user.role === "agency") {
    const agency = await Agency.findOne({ ownerUser: req.user._id });
    if (!agency) {
      return res.status(404).json({ message: "Agency profile not found" });
    }

    filters.postedBy = agency._id;
  }

  const jobs = await Job.find(filters).populate(jobPopulateConfig).sort({ createdAt: -1 });

  const jobsWithMeta = await Promise.all(
    jobs.map(async (job) => {
      const applicationsCount = await JobApplication.countDocuments({ job: job._id });
      return {
        ...job.toObject(),
        applicationsCount
      };
    })
  );

  return res.json({
    count: jobsWithMeta.length,
    jobs: jobsWithMeta
  });
});

export const applyToJob = asyncHandler(async (req, res) => {
  const { applicantName, phone, experience } = req.body;

  const job = await Job.findById(req.params.id).populate(jobPopulateConfig);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  const existingApplication = await JobApplication.findOne({ job: job._id, applicant: req.user._id });
  if (existingApplication) {
    return res.status(409).json({ message: "You have already applied for this job" });
  }

  const resolvedApplicantName = applicantName || req.user.fullName;
  const resolvedPhone = phone || req.user.phone;

  if (!resolvedPhone) {
    return res.status(400).json({ message: "Phone number is required to apply" });
  }

  const application = await JobApplication.create({
    job: job._id,
    applicant: req.user._id,
    applicantName: resolvedApplicantName,
    phone: resolvedPhone,
    experience
  });

  return res.status(201).json({
    message: "Job application submitted successfully",
    application,
    job
  });
});

export const submitOpenApplication = asyncHandler(async (req, res) => {
  const { applicantName, phone, experience } = req.body;

  const resolvedApplicantName = applicantName || req.user.fullName;
  const resolvedPhone = phone || req.user.phone;

  if (!resolvedPhone) {
    return res.status(400).json({ message: "Phone number is required to apply" });
  }

  const existingOpenApplication = await JobApplication.findOne({
    applicant: req.user._id,
    ...openApplicationFilter
  });

  if (existingOpenApplication) {
    existingOpenApplication.applicantName = resolvedApplicantName;
    existingOpenApplication.phone = resolvedPhone;
    existingOpenApplication.experience = experience;
    existingOpenApplication.status = "pending";
    await existingOpenApplication.save();

    return res.json({
      message: "Open application updated successfully",
      application: existingOpenApplication
    });
  }

  const application = await JobApplication.create({
    applicant: req.user._id,
    applicantName: resolvedApplicantName,
    phone: resolvedPhone,
    experience
  });

  return res.status(201).json({
    message: "Open application submitted successfully",
    application
  });
});

export const listOpenApplications = asyncHandler(async (_req, res) => {
  const applications = await JobApplication.find(openApplicationFilter)
    .populate("applicant", "fullName email phone role")
    .sort({ createdAt: -1 });

  return res.json({
    count: applications.length,
    applications
  });
});

export const getJobApplications = asyncHandler(async (req, res) => {
  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const job = await Job.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (String(job.postedBy) !== String(agency._id)) {
    return res.status(403).json({ message: "Cannot view applications for this job" });
  }

  const applications = await JobApplication.find({ job: job._id })
    .populate("applicant", "fullName email phone role")
    .sort({ createdAt: -1 });

  return res.json({
    count: applications.length,
    applications
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const application = await JobApplication.findById(req.params.id).populate({
    path: "job",
    select: "postedBy title"
  });

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (String(application.job.postedBy) !== String(agency._id)) {
    return res.status(403).json({ message: "Cannot update this application" });
  }

  application.status = status;
  await application.save();

  return res.json({
    message: "Application status updated successfully",
    application
  });
});
