import Agency from "../models/Agency.js";
import ArrivalChallan from "../models/ArrivalChallan.js";
import Booking from "../models/Booking.js";
import LR from "../models/LR.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateDocNumber } from "../utils/docNumber.js";

export const createArrival = asyncHandler(async (req, res) => {
  const { lrId, hubLocation, remarks } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const lr = await LR.findById(lrId);
  if (!lr) {
    return res.status(404).json({ message: "LR not found" });
  }

  if (String(lr.agency) !== String(agency._id)) {
    return res.status(403).json({ message: "Cannot mark arrival for this LR" });
  }

  if (lr.status !== "Dispatched") {
    return res.status(400).json({ message: "Arrival can only be marked after dispatch" });
  }

  const existingArrival = await ArrivalChallan.findOne({ lr: lr._id });
  if (existingArrival) {
    return res.status(400).json({ message: "Arrival challan already exists for this LR" });
  }

  const booking = await Booking.findById(lr.booking);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found for this LR" });
  }

  const arrivalChallan = await ArrivalChallan.create({
    challanNumber: generateDocNumber("ARR"),
    lr: lr._id,
    booking: booking._id,
    agency: agency._id,
    vehicle: lr.vehicle,
    hubLocation,
    remarks,
    createdBy: req.user._id
  });

  lr.status = "Arrived";
  booking.status = "Arrived";

  await Promise.all([lr.save(), booking.save()]);

  return res.status(201).json({
    message: "Arrival challan created",
    arrivalChallan
  });
});
