import Agency from "../models/Agency.js";
import Booking from "../models/Booking.js";
import DeliveryRecord from "../models/DeliveryRecord.js";
import LR from "../models/LR.js";
import Vehicle from "../models/Vehicle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateDocNumber } from "../utils/docNumber.js";

export const createDelivery = asyncHandler(async (req, res) => {
  const { lrId, recipientName, recipientPhone, proofOfDelivery, remarks } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const lr = await LR.findById(lrId);
  if (!lr) {
    return res.status(404).json({ message: "LR not found" });
  }

  if (String(lr.agency) !== String(agency._id)) {
    return res.status(403).json({ message: "Cannot mark delivery for this LR" });
  }

  if (lr.status === "Delivered") {
    return res.status(400).json({ message: "Delivery already completed for this LR" });
  }

  const existingDelivery = await DeliveryRecord.findOne({ lr: lr._id });
  if (existingDelivery) {
    return res.status(400).json({ message: "Delivery record already exists for this LR" });
  }

  const booking = await Booking.findById(lr.booking);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found for this LR" });
  }

  const deliveryRecord = await DeliveryRecord.create({
    deliveryNumber: generateDocNumber("DLV"),
    lr: lr._id,
    booking: booking._id,
    agency: agency._id,
    vehicle: lr.vehicle,
    recipientName,
    recipientPhone,
    proofOfDelivery,
    remarks,
    createdBy: req.user._id
  });

  lr.status = "Delivered";
  booking.status = "Delivered";

  if (lr.vehicle) {
    const vehicle = await Vehicle.findById(lr.vehicle);
    if (vehicle) {
      vehicle.isActive = false;
      vehicle.assignedLR = null;
      await vehicle.save();
    }
  }

  await Promise.all([lr.save(), booking.save()]);

  return res.status(201).json({
    message: "Delivery completed",
    deliveryRecord
  });
});
