import Agency from "../models/Agency.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const routeFilter = (from, to) => {
  const elemMatch = {};

  if (from) {
    elemMatch.from = { $regex: new RegExp(from, "i") };
  }

  if (to) {
    elemMatch.to = { $regex: new RegExp(to, "i") };
  }

  return Object.keys(elemMatch).length ? { routes: { $elemMatch: elemMatch } } : {};
};

export const createAgency = asyncHandler(async (req, res) => {
  const { agencyName, city, gstNumber, contactNumber, routes = [] } = req.body;

  const existing = await Agency.findOne({ ownerUser: req.user._id });
  if (existing) {
    return res.status(400).json({ message: "Agency profile already exists for this user" });
  }

  const agency = await Agency.create({
    ownerUser: req.user._id,
    agencyName,
    city,
    gstNumber,
    contactNumber,
    routes
  });

  return res.status(201).json({
    message: "Agency created successfully",
    agency
  });
});

export const addRoute = asyncHandler(async (req, res) => {
  const { from, to, basePricePerKg, estimatedDays } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  agency.routes.push({
    from,
    to,
    basePricePerKg,
    estimatedDays
  });

  await agency.save();

  return res.status(201).json({
    message: "Route added successfully",
    routes: agency.routes
  });
});

export const searchAgencies = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const agencies = await Agency.find(routeFilter(from, to)).select("agencyName city contactNumber rating routes");

  const result = agencies.map((agency) => {
    const matchingRoutes = agency.routes.filter((route) => {
      const fromMatch = from ? route.from.toLowerCase().includes(from.toLowerCase()) : true;
      const toMatch = to ? route.to.toLowerCase().includes(to.toLowerCase()) : true;
      return fromMatch && toMatch;
    });

    return {
      id: agency._id,
      agencyName: agency.agencyName,
      city: agency.city,
      contactNumber: agency.contactNumber,
      rating: agency.rating,
      matchingRoutes: matchingRoutes.length ? matchingRoutes : agency.routes.slice(0, 3)
    };
  });

  return res.json({
    count: result.length,
    agencies: result
  });
});

export const listAgencies = asyncHandler(async (_req, res) => {
  const agencies = await Agency.find({}).select("agencyName city contactNumber rating routes").sort({ createdAt: -1 });

  return res.json({
    count: agencies.length,
    agencies
  });
});

export const getMyAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findOne({ ownerUser: req.user._id });

  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  return res.json({ agency });
});
