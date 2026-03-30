import Agency from "../models/Agency.js";
import Booking from "../models/Booking.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const normalize = (text) => text.trim().toLowerCase();

export const createBooking = asyncHandler(async (req, res) => {
  const {
    agencyId,
    sourceCity,
    destinationCity,
    goodsDescription,
    weightKg,
    pickupDate,
    notes,
    estimatedPrice: estimatedPriceInput
  } = req.body;

  const agency = await Agency.findById(agencyId);
  if (!agency) {
    return res.status(404).json({ message: "Agency not found" });
  }

  const matchedRoute = agency.routes.find(
    (route) =>
      route.isActive &&
      normalize(route.from) === normalize(sourceCity) &&
      normalize(route.to) === normalize(destinationCity)
  );

  const estimatedPrice =
    matchedRoute && matchedRoute.basePricePerKg
      ? Number((matchedRoute.basePricePerKg * Number(weightKg)).toFixed(2))
      : Number(estimatedPriceInput || 10 * Number(weightKg));

  const booking = await Booking.create({
    customer: req.user._id,
    agency: agency._id,
    sourceCity,
    destinationCity,
    goodsDescription,
    weightKg,
    pickupDate,
    notes,
    estimatedPrice
  });

  const populated = await Booking.findById(booking._id).populate("agency", "agencyName city rating");

  return res.status(201).json({
    message: "Booking created successfully",
    booking: populated
  });
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customer: req.user._id })
    .populate("agency", "agencyName city contactNumber rating")
    .populate("lr", "lrNumber status")
    .sort({ createdAt: -1 });

  return res.json({
    count: bookings.length,
    bookings
  });
});

export const getAgencyBookings = asyncHandler(async (req, res) => {
  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const bookings = await Booking.find({ agency: agency._id })
    .populate("customer", "fullName email phone")
    .populate("lr", "lrNumber status vehicle")
    .sort({ createdAt: -1 });

  return res.json({
    count: bookings.length,
    bookings
  });
});

export const getAgencyStats = asyncHandler(async (req, res) => {
  const agency = await Agency.findOne({ ownerUser: req.user._id });
  if (!agency) {
    return res.status(404).json({ message: "Agency profile not found" });
  }

  const [totalBookings, delivered, inTransit] = await Promise.all([
    Booking.countDocuments({ agency: agency._id }),
    Booking.countDocuments({ agency: agency._id, status: "Delivered" }),
    Booking.countDocuments({
      agency: agency._id,
      status: { $in: ["Dispatched", "Arrived"] }
    })
  ]);

  return res.json({
    totalBookings,
    delivered,
    inTransit
  });
});
