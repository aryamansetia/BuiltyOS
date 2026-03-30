import Agency from "../models/Agency.js";
import Booking from "../models/Booking.js";
import LR from "../models/LR.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateDocNumber } from "../utils/docNumber.js";

export const createLR = asyncHandler(async (req, res) => {
  const { bookingId, freightAmount, consignorName, consigneeName } = req.body;

  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (String(booking.agency) !== String(agency._id)) {
    return res.status(403).json({ message: "Cannot create LR for this booking" });
  }

  if (booking.lr) {
    return res.status(400).json({ message: "LR already created for this booking" });
  }

  const lr = await LR.create({
    lrNumber: generateDocNumber("LR"),
    booking: booking._id,
    agency: agency._id,
    freightAmount: freightAmount || booking.estimatedPrice,
    consignorName,
    consigneeName,
    status: booking.status
  });

  booking.lr = lr._id;
  await booking.save();

  return res.status(201).json({
    message: "LR generated successfully",
    lr
  });
});

export const downloadLRMock = asyncHandler(async (req, res) => {
  const { lrId } = req.params;

  const lr = await LR.findById(lrId)
    .populate("booking")
    .populate("agency", "agencyName city contactNumber")
    .populate("vehicle", "vehicleNumber driverName driverPhone");

  if (!lr) {
    return res.status(404).json({ message: "LR not found" });
  }

  const mockDocument = [
    "BUILTYOS - LR MOCK DOCUMENT",
    "================================",
    `LR Number: ${lr.lrNumber}`,
    `Status: ${lr.status}`,
    `Agency: ${lr.agency?.agencyName || "-"}`,
    `Route: ${lr.booking?.sourceCity || "-"} to ${lr.booking?.destinationCity || "-"}`,
    `Consignor: ${lr.consignorName}`,
    `Consignee: ${lr.consigneeName}`,
    `Freight Amount: INR ${lr.freightAmount}`,
    `Vehicle: ${lr.vehicle?.vehicleNumber || "Not assigned"}`,
    `Generated At: ${new Date(lr.generatedAt).toLocaleString()}`,
    "",
    "Note: This is a mock export for MVP. Replace with PDF engine in production."
  ].join("\n");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${lr.lrNumber}.txt"`);

  return res.send(mockDocument);
});
