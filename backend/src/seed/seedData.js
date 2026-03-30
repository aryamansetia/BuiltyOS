import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Agency from "../models/Agency.js";
import ArrivalChallan from "../models/ArrivalChallan.js";
import Booking from "../models/Booking.js";
import DeliveryRecord from "../models/DeliveryRecord.js";
import DispatchChallan from "../models/DispatchChallan.js";
import GPSLog from "../models/GPSLog.js";
import LR from "../models/LR.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { generateDocNumber } from "../utils/docNumber.js";

dotenv.config();

const seedData = async () => {
  await connectDB();

  await Promise.all([
    GPSLog.deleteMany({}),
    DeliveryRecord.deleteMany({}),
    ArrivalChallan.deleteMany({}),
    DispatchChallan.deleteMany({}),
    LR.deleteMany({}),
    Booking.deleteMany({}),
    Vehicle.deleteMany({}),
    Agency.deleteMany({}),
    User.deleteMany({})
  ]);

  const agencyUser = await User.create({
    fullName: "Amit Logistics",
    email: "agency@builtyos.com",
    password: "Password123",
    phone: "9876543210",
    role: "agency",
    preferredLanguage: "en"
  });

  const customerUser = await User.create({
    fullName: "Priya Traders",
    email: "customer@builtyos.com",
    password: "Password123",
    phone: "9123456780",
    role: "customer",
    preferredLanguage: "hi"
  });

  const agency = await Agency.create({
    ownerUser: agencyUser._id,
    agencyName: "Amit Cargo Movers",
    city: "Delhi",
    gstNumber: "07ABCDE1234F1Z5",
    contactNumber: "9876543210",
    rating: 4.5,
    routes: [
      {
        from: "Delhi",
        to: "Mumbai",
        basePricePerKg: 12,
        estimatedDays: 3
      },
      {
        from: "Delhi",
        to: "Chennai",
        basePricePerKg: 15,
        estimatedDays: 4
      },
      {
        from: "Mumbai",
        to: "Chennai",
        basePricePerKg: 10,
        estimatedDays: 2
      }
    ]
  });

  const vehicleDelivered = await Vehicle.create({
    agency: agency._id,
    vehicleNumber: "DL01AB1234",
    driverName: "Ramesh Kumar",
    driverPhone: "9000000001",
    currentLocation: {
      latitude: 19.076,
      longitude: 72.8777,
      updatedAt: new Date()
    },
    isActive: false
  });

  const vehicleTransit = await Vehicle.create({
    agency: agency._id,
    vehicleNumber: "DL02XY5678",
    driverName: "Suresh Yadav",
    driverPhone: "9000000002",
    currentLocation: {
      latitude: 23.5937,
      longitude: 80.9629,
      updatedAt: new Date()
    },
    isActive: true
  });

  const deliveredBooking = await Booking.create({
    customer: customerUser._id,
    agency: agency._id,
    sourceCity: "Delhi",
    destinationCity: "Mumbai",
    goodsDescription: "Textile rolls",
    weightKg: 450,
    estimatedPrice: 5400,
    pickupDate: new Date(),
    status: "Delivered"
  });

  const inTransitBooking = await Booking.create({
    customer: customerUser._id,
    agency: agency._id,
    sourceCity: "Delhi",
    destinationCity: "Chennai",
    goodsDescription: "Electrical components",
    weightKg: 220,
    estimatedPrice: 3300,
    pickupDate: new Date(),
    status: "Dispatched"
  });

  const bookedOnly = await Booking.create({
    customer: customerUser._id,
    agency: agency._id,
    sourceCity: "Mumbai",
    destinationCity: "Chennai",
    goodsDescription: "Packaged food cartons",
    weightKg: 125,
    estimatedPrice: 1250,
    pickupDate: new Date(),
    status: "Booked"
  });

  const deliveredLr = await LR.create({
    lrNumber: generateDocNumber("LR"),
    booking: deliveredBooking._id,
    agency: agency._id,
    vehicle: vehicleDelivered._id,
    freightAmount: deliveredBooking.estimatedPrice,
    consignorName: "Priya Traders",
    consigneeName: "Mumbai Bazaar Hub",
    status: "Delivered"
  });

  const transitLr = await LR.create({
    lrNumber: generateDocNumber("LR"),
    booking: inTransitBooking._id,
    agency: agency._id,
    vehicle: vehicleTransit._id,
    freightAmount: inTransitBooking.estimatedPrice,
    consignorName: "Priya Traders",
    consigneeName: "Chennai Electronics Park",
    status: "Dispatched"
  });

  deliveredBooking.lr = deliveredLr._id;
  inTransitBooking.lr = transitLr._id;
  bookedOnly.lr = null;

  vehicleDelivered.assignedLR = null;
  vehicleTransit.assignedLR = transitLr._id;

  await Promise.all([deliveredBooking.save(), inTransitBooking.save(), bookedOnly.save(), vehicleDelivered.save(), vehicleTransit.save()]);

  await DispatchChallan.create({
    challanNumber: generateDocNumber("DIS"),
    lr: deliveredLr._id,
    booking: deliveredBooking._id,
    agency: agency._id,
    vehicle: vehicleDelivered._id,
    fromCity: deliveredBooking.sourceCity,
    toCity: deliveredBooking.destinationCity,
    remarks: "Left Delhi terminal",
    createdBy: agencyUser._id
  });

  await ArrivalChallan.create({
    challanNumber: generateDocNumber("ARR"),
    lr: deliveredLr._id,
    booking: deliveredBooking._id,
    agency: agency._id,
    vehicle: vehicleDelivered._id,
    hubLocation: "Mumbai Hub",
    remarks: "Arrived on schedule",
    createdBy: agencyUser._id
  });

  await DeliveryRecord.create({
    deliveryNumber: generateDocNumber("DLV"),
    lr: deliveredLr._id,
    booking: deliveredBooking._id,
    agency: agency._id,
    vehicle: vehicleDelivered._id,
    recipientName: "Anil Mehta",
    recipientPhone: "9000000003",
    proofOfDelivery: "Signed paper POD",
    remarks: "Delivered safely",
    createdBy: agencyUser._id
  });

  await DispatchChallan.create({
    challanNumber: generateDocNumber("DIS"),
    lr: transitLr._id,
    booking: inTransitBooking._id,
    agency: agency._id,
    vehicle: vehicleTransit._id,
    fromCity: inTransitBooking.sourceCity,
    toCity: inTransitBooking.destinationCity,
    remarks: "In transit",
    createdBy: agencyUser._id
  });

  await GPSLog.insertMany([
    {
      vehicle: vehicleTransit._id,
      lr: transitLr._id,
      latitude: 22.7196,
      longitude: 75.8577,
      speed: 48,
      source: "simulated",
      recordedAt: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      vehicle: vehicleTransit._id,
      lr: transitLr._id,
      latitude: 23.1765,
      longitude: 79.9864,
      speed: 45,
      source: "simulated",
      recordedAt: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      vehicle: vehicleTransit._id,
      lr: transitLr._id,
      latitude: 23.5937,
      longitude: 80.9629,
      speed: 42,
      source: "simulated",
      recordedAt: new Date()
    }
  ]);

  console.log("Seed completed");
  console.log("Agency Login: agency@builtyos.com / Password123");
  console.log("Customer Login: customer@builtyos.com / Password123");
  console.log(`Track with LR: ${transitLr.lrNumber}`);

  await mongoose.connection.close();
};

seedData().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
