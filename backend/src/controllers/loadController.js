import Agency from "../models/Agency.js";
import Load from "../models/Load.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const buildLoadFilters = (query) => {
  const filters = {};

  if (query.origin) {
    filters.origin = { $regex: new RegExp(query.origin, "i") };
  }

  if (query.destination) {
    filters.destination = { $regex: new RegExp(query.destination, "i") };
  }

  if (query.vehicleType) {
    filters.vehicleType = { $regex: new RegExp(query.vehicleType, "i") };
  }

  if (query.status && ["open", "assigned", "completed"].includes(query.status)) {
    filters.status = query.status;
  }

  const minPrice = Number(query.minPrice);
  const maxPrice = Number(query.maxPrice);

  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filters.price = {};

    if (Number.isFinite(minPrice)) {
      filters.price.$gte = minPrice;
    }

    if (Number.isFinite(maxPrice)) {
      filters.price.$lte = maxPrice;
    }
  }

  return filters;
};

const loadPopulateConfig = [
  { path: "postedBy", select: "agencyName city contactNumber rating" },
  { path: "assignedTo", select: "fullName phone role" },
  { path: "applicants", select: "fullName phone role" },
  { path: "linkedBooking", select: "sourceCity destinationCity goodsDescription weightKg status" }
];

export const createLoad = asyncHandler(async (req, res) => {
  const { origin, destination, price, weight, vehicleType, notes, linkedBooking } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const load = await Load.create({
    origin,
    destination,
    price,
    weight,
    vehicleType,
    notes,
    linkedBooking,
    postedBy: agency._id
  });

  const populatedLoad = await Load.findById(load._id).populate(loadPopulateConfig);

  return res.status(201).json({
    message: "Load posted successfully",
    load: populatedLoad
  });
});

export const listLoads = asyncHandler(async (req, res) => {
  const filters = buildLoadFilters(req.query);

  const loads = await Load.find(filters).populate(loadPopulateConfig).sort({ createdAt: -1 });

  return res.json({
    count: loads.length,
    loads
  });
});

export const getLoadById = asyncHandler(async (req, res) => {
  const load = await Load.findById(req.params.id).populate(loadPopulateConfig);

  if (!load) {
    return res.status(404).json({ message: "Load not found" });
  }

  return res.json({ load });
});

export const applyToLoad = asyncHandler(async (req, res) => {
  const load = await Load.findById(req.params.id);

  if (!load) {
    return res.status(404).json({ message: "Load not found" });
  }

  if (load.status !== "open") {
    return res.status(400).json({ message: "Only open loads can be accepted" });
  }

  if (load.applicants.some((applicantId) => String(applicantId) === String(req.user._id))) {
    return res.status(409).json({ message: "You have already requested this load" });
  }

  load.applicants.push(req.user._id);
  await load.save();

  const populatedLoad = await Load.findById(load._id).populate(loadPopulateConfig);

  return res.json({
    message: "Load request submitted successfully",
    load: populatedLoad
  });
});

export const assignLoad = asyncHandler(async (req, res) => {
  const { driverId } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const load = await Load.findById(req.params.id);
  if (!load) {
    return res.status(404).json({ message: "Load not found" });
  }

  if (String(load.postedBy) !== String(agency._id)) {
    return res.status(403).json({ message: "Cannot assign drivers for this load" });
  }

  if (load.status === "completed") {
    return res.status(400).json({ message: "Completed load cannot be reassigned" });
  }

  const driver = await User.findById(driverId).select("fullName phone role");
  if (!driver || driver.role !== "worker") {
    return res.status(400).json({ message: "Assigned user must be a working partner" });
  }

  if (!load.applicants.some((applicantId) => String(applicantId) === String(driver._id))) {
    load.applicants.push(driver._id);
  }

  load.assignedTo = driver._id;
  load.status = "assigned";
  await load.save();

  const populatedLoad = await Load.findById(load._id).populate(loadPopulateConfig);

  return res.json({
    message: "Working partner assigned to load successfully",
    load: populatedLoad
  });
});
