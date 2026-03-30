import Agency from "../models/Agency.js";
import Booking from "../models/Booking.js";
import DispatchChallan from "../models/DispatchChallan.js";
import GPSLog from "../models/GPSLog.js";
import LR from "../models/LR.js";
import Vehicle from "../models/Vehicle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateDocNumber } from "../utils/docNumber.js";

export const createDispatch = asyncHandler(async (req, res) => {
  const {
    lrId,
    vehicleId,
    vehicleNumber,
    driverName,
    driverPhone,
    remarks,
    initialLatitude,
    initialLongitude
  } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const lr = await LR.findById(lrId);
  if (!lr) {
    return res.status(404).json({ message: "LR not found" });
  }

  if (String(lr.agency) !== String(agency._id)) {
    return res.status(403).json({ message: "Cannot dispatch this LR" });
  }

  if (lr.status !== "Booked") {
    return res.status(400).json({ message: `LR is already in ${lr.status} status` });
  }

  const existingDispatch = await DispatchChallan.findOne({ lr: lr._id });
  if (existingDispatch) {
    return res.status(400).json({ message: "Dispatch challan already exists for this LR" });
  }

  const booking = await Booking.findById(lr.booking);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found for this LR" });
  }

  let vehicle = null;
  if (vehicleId) {
    vehicle = await Vehicle.findOne({ _id: vehicleId, agency: agency._id });
  }

  if (!vehicle && vehicleNumber) {
    vehicle = await Vehicle.findOne({ agency: agency._id, vehicleNumber: vehicleNumber.toUpperCase() });
    if (!vehicle) {
      vehicle = await Vehicle.create({
        agency: agency._id,
        vehicleNumber: vehicleNumber.toUpperCase(),
        driverName: driverName || "TBD Driver",
        driverPhone
      });
    }
  }

  if (!vehicle) {
    return res.status(400).json({
      message: "Provide a valid vehicleId or vehicleNumber for dispatch"
    });
  }

  if (driverName) {
    vehicle.driverName = driverName;
  }

  if (driverPhone) {
    vehicle.driverPhone = driverPhone;
  }

  if (typeof initialLatitude === "number" && typeof initialLongitude === "number") {
    vehicle.currentLocation = {
      latitude: initialLatitude,
      longitude: initialLongitude,
      updatedAt: new Date()
    };
  }

  vehicle.isActive = true;
  vehicle.assignedLR = lr._id;
  await vehicle.save();

  lr.vehicle = vehicle._id;
  lr.status = "Dispatched";
  await lr.save();

  booking.status = "Dispatched";
  await booking.save();

  const dispatchChallan = await DispatchChallan.create({
    challanNumber: generateDocNumber("DIS"),
    lr: lr._id,
    booking: booking._id,
    agency: agency._id,
    vehicle: vehicle._id,
    fromCity: booking.sourceCity,
    toCity: booking.destinationCity,
    remarks,
    createdBy: req.user._id
  });

  await GPSLog.create({
    vehicle: vehicle._id,
    lr: lr._id,
    latitude: vehicle.currentLocation.latitude,
    longitude: vehicle.currentLocation.longitude,
    source: "device"
  });

  return res.status(201).json({
    message: "Dispatch challan created and vehicle assigned",
    dispatchChallan,
    lrNumber: lr.lrNumber,
    vehicle
  });
});
