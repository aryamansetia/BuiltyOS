import Agency from "../models/Agency.js";
import Vehicle from "../models/Vehicle.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createVehicle = asyncHandler(async (req, res) => {
  const { vehicleNumber, driverName, driverPhone, latitude, longitude } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const existing = await Vehicle.findOne({
    agency: agency._id,
    vehicleNumber: vehicleNumber.toUpperCase()
  });

  if (existing) {
    return res.status(409).json({ message: "Vehicle already exists" });
  }

  const vehicle = await Vehicle.create({
    agency: agency._id,
    vehicleNumber: vehicleNumber.toUpperCase(),
    driverName,
    driverPhone,
    currentLocation: {
      latitude: typeof latitude === "number" ? latitude : 28.6139,
      longitude: typeof longitude === "number" ? longitude : 77.209,
      updatedAt: new Date()
    }
  });

  return res.status(201).json({
    message: "Vehicle created",
    vehicle
  });
});

export const listVehicles = asyncHandler(async (req, res) => {
  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const vehicles = await Vehicle.find({ agency: agency._id }).sort({ createdAt: -1 });

  return res.json({
    count: vehicles.length,
    vehicles
  });
});
