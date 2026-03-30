import GPSLog from "../models/GPSLog.js";
import Vehicle from "../models/Vehicle.js";

let intervalRef = null;
let running = false;

const jitter = (value) => Number((value + (Math.random() - 0.5) * 0.02).toFixed(6));

const simulateCycle = async () => {
  if (running) {
    return;
  }

  running = true;

  try {
    const activeVehicles = await Vehicle.find({ isActive: true });

    for (const vehicle of activeVehicles) {
      const nextLatitude = jitter(vehicle.currentLocation?.latitude || 28.6139);
      const nextLongitude = jitter(vehicle.currentLocation?.longitude || 77.209);

      vehicle.currentLocation = {
        latitude: nextLatitude,
        longitude: nextLongitude,
        updatedAt: new Date()
      };

      await vehicle.save();

      await GPSLog.create({
        vehicle: vehicle._id,
        lr: vehicle.assignedLR || null,
        latitude: nextLatitude,
        longitude: nextLongitude,
        speed: 35 + Math.round(Math.random() * 25),
        source: "simulated"
      });
    }
  } catch (error) {
    console.error("GPS simulator cycle failed:", error.message);
  } finally {
    running = false;
  }
};

export const startGpsSimulator = () => {
  const interval = Number(process.env.GPS_SIMULATION_INTERVAL_MS || 20000);

  if (intervalRef) {
    return;
  }

  intervalRef = setInterval(simulateCycle, interval);
  console.log(`GPS simulator started (interval: ${interval}ms)`);
};

export const stopGpsSimulator = () => {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
    console.log("GPS simulator stopped");
  }
};
