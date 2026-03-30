import ArrivalChallan from "../models/ArrivalChallan.js";
import DispatchChallan from "../models/DispatchChallan.js";
import DeliveryRecord from "../models/DeliveryRecord.js";
import GPSLog from "../models/GPSLog.js";
import LR from "../models/LR.js";
import Vehicle from "../models/Vehicle.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getTrackingByLR = asyncHandler(async (req, res) => {
  const { lrNumber } = req.query;

  if (!lrNumber) {
    return res.status(400).json({ message: "lrNumber query parameter is required" });
  }

  const lr = await LR.findOne({ lrNumber })
    .populate("booking")
    .populate("agency", "agencyName contactNumber city")
    .populate("vehicle", "vehicleNumber driverName driverPhone currentLocation isActive");

  if (!lr) {
    return res.status(404).json({ message: "LR not found" });
  }

  const [dispatch, arrival, delivery] = await Promise.all([
    DispatchChallan.findOne({ lr: lr._id }),
    ArrivalChallan.findOne({ lr: lr._id }),
    DeliveryRecord.findOne({ lr: lr._id })
  ]);

  let gpsLogs = [];
  if (lr.vehicle?._id) {
    gpsLogs = await GPSLog.find({ vehicle: lr.vehicle._id }).sort({ recordedAt: -1 }).limit(20);
  }

  const timeline = [
    {
      label: "Booked",
      completed: true,
      timestamp: lr.booking?.createdAt
    },
    {
      label: "Dispatched",
      completed: Boolean(dispatch),
      timestamp: dispatch?.dispatchDate || null
    },
    {
      label: "Arrived",
      completed: Boolean(arrival),
      timestamp: arrival?.arrivalDate || null
    },
    {
      label: "Delivered",
      completed: Boolean(delivery),
      timestamp: delivery?.deliveredAt || null
    }
  ];

  return res.json({
    lrNumber: lr.lrNumber,
    status: lr.status,
    agency: lr.agency,
    booking: lr.booking,
    vehicle: lr.vehicle,
    currentLocation: lr.vehicle?.currentLocation || null,
    gpsLogs,
    timeline
  });
});

export const updateGPS = asyncHandler(async (req, res) => {
  const { vehicleId, lrNumber, latitude, longitude, speed } = req.body;

  let vehicle = null;
  let linkedLr = null;

  if (vehicleId) {
    vehicle = await Vehicle.findById(vehicleId);
  }

  if (!vehicle && lrNumber) {
    linkedLr = await LR.findOne({ lrNumber }).populate("vehicle");
    if (linkedLr?.vehicle) {
      vehicle = linkedLr.vehicle;
    }
  }

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found for GPS update" });
  }

  vehicle.currentLocation = {
    latitude,
    longitude,
    updatedAt: new Date()
  };

  await vehicle.save();

  const gpsLog = await GPSLog.create({
    vehicle: vehicle._id,
    lr: linkedLr?._id || vehicle.assignedLR || null,
    latitude,
    longitude,
    speed: speed || 0,
    source: "device"
  });

  return res.status(201).json({
    message: "GPS location updated",
    gpsLog,
    currentLocation: vehicle.currentLocation
  });
});
