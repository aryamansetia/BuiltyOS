import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";

const TRACKING_REFRESH_INTERVAL_MS = 15000;
const DEFAULT_ETA = new Date("2026-04-08T00:00:00");
const LANDMARKS = [
  { label: "Bandhavgarh National Park", latitude: 23.5937, longitude: 80.9629 },
  { label: "Indore Corridor", latitude: 22.7196, longitude: 75.8577 },
  { label: "Jabalpur Transit Zone", latitude: 23.1765, longitude: 79.9864 },
  { label: "Mumbai Distribution Belt", latitude: 19.076, longitude: 72.8777 },
  { label: "Delhi Freight Ring", latitude: 28.6139, longitude: 77.209 }
];

const parseCoordinate = (value) => {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const toRadians = (value) => (value * Math.PI) / 180;
const toDegrees = (value) => (value * 180) / Math.PI;

const calculateHeading = (fromPoint, toPoint) => {
  const latitudeFrom = toRadians(fromPoint.latitude);
  const latitudeTo = toRadians(toPoint.latitude);
  const longitudeDelta = toRadians(toPoint.longitude - fromPoint.longitude);

  const y = Math.sin(longitudeDelta) * Math.cos(latitudeTo);
  const x =
    Math.cos(latitudeFrom) * Math.sin(latitudeTo) -
    Math.sin(latitudeFrom) * Math.cos(latitudeTo) * Math.cos(longitudeDelta);

  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
};

const createTruckMarkerIcon = (heading) =>
  divIcon({
    className: "control-tower-truck-wrapper",
    html: `<div class="control-tower-truck" style="transform: rotate(${heading.toFixed(1)}deg)">
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M10 18h30l8 11h6v11h-6v6h-8v-6H24v6h-8v-6h-6z" fill="#2563EB" />
        <circle cx="20" cy="46" r="6" fill="#0F172A" />
        <circle cx="42" cy="46" r="6" fill="#0F172A" />
        <rect x="36" y="21" width="9" height="7" rx="1.5" fill="#BFDBFE" />
      </svg>
    </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });

const formatTimestamp = (value) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString();
};

const formatFeedTime = (value) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
};

const getLandmarkLabel = (latitude, longitude) => {
  const nearestLandmark = LANDMARKS.reduce(
    (closest, landmark) => {
      const distance = Math.hypot(latitude - landmark.latitude, longitude - landmark.longitude);
      if (distance < closest.distance) {
        return { label: landmark.label, distance };
      }
      return closest;
    },
    { label: "", distance: Number.POSITIVE_INFINITY }
  );

  if (nearestLandmark.distance <= 1.1) {
    return nearestLandmark.label;
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};

const getMapLink = (latitude, longitude) =>
  `https://www.openstreetmap.org/?mlat=${latitude.toFixed(6)}&mlon=${longitude.toFixed(6)}#map=15/${latitude.toFixed(6)}/${longitude.toFixed(6)}`;

function TrackingPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [lrNumber, setLrNumber] = useState(searchParams.get("lrNumber") || "");
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFullHistory, setShowFullHistory] = useState(false);

  const fetchTracking = useCallback(
    async (targetLr, options = {}) => {
      const { clearPrevious = true } = options;
      const normalizedLr = targetLr.trim();
      if (!normalizedLr) {
        setTracking(null);
        setError(t("customer.enterLr"));
        return;
      }

      setLoading(true);
      setError("");
      if (clearPrevious) {
        setTracking(null);
      }

      try {
        const { data } = await axiosClient.get("/tracking", {
          params: { lrNumber: normalizedLr }
        });
        setTracking(data);
      } catch (trackError) {
        setError(trackError.message);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  useEffect(() => {
    const queryLrNumber = (searchParams.get("lrNumber") || "").trim();
    setShowFullHistory(false);

    if (queryLrNumber) {
      setLrNumber(queryLrNumber);
      fetchTracking(queryLrNumber, { clearPrevious: true });
    } else {
      setTracking(null);
      setError("");
    }
  }, [searchParams, fetchTracking]);

  useEffect(() => {
    const queryLrNumber = (searchParams.get("lrNumber") || "").trim();
    if (!queryLrNumber) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      fetchTracking(queryLrNumber, { clearPrevious: false });
    }, TRACKING_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [searchParams, fetchTracking]);

  const onTrack = (event) => {
    event.preventDefault();
    const normalizedLr = lrNumber.trim();
    if (!normalizedLr) {
      setError(t("customer.enterLr"));
      setTracking(null);
      return;
    }

    setSearchParams({ lrNumber: normalizedLr });
  };

  const hasSearchedLr = Boolean((searchParams.get("lrNumber") || "").trim());
  const timeline = tracking?.timeline || [];

  const recentGpsLogs = useMemo(
    () =>
      [...(tracking?.gpsLogs || [])].sort(
        (leftLog, rightLog) => new Date(rightLog.recordedAt).getTime() - new Date(leftLog.recordedAt).getTime()
      ),
    [tracking?.gpsLogs]
  );

  const latestGpsLog = recentGpsLogs[0] || null;
  const previousGpsLog = recentGpsLogs[1] || null;

  const latitude = parseCoordinate(tracking?.currentLocation?.latitude) ?? parseCoordinate(latestGpsLog?.latitude);
  const longitude = parseCoordinate(tracking?.currentLocation?.longitude) ?? parseCoordinate(latestGpsLog?.longitude);
  const hasValidLocation = latitude !== null && longitude !== null;
  const mapLink = hasValidLocation ? getMapLink(latitude, longitude) : "";

  const heading = useMemo(() => {
    const fromLatitude = parseCoordinate(previousGpsLog?.latitude);
    const fromLongitude = parseCoordinate(previousGpsLog?.longitude);
    const toLatitude = parseCoordinate(latestGpsLog?.latitude);
    const toLongitude = parseCoordinate(latestGpsLog?.longitude);

    if (
      fromLatitude === null ||
      fromLongitude === null ||
      toLatitude === null ||
      toLongitude === null
    ) {
      return 0;
    }

    return calculateHeading(
      { latitude: fromLatitude, longitude: fromLongitude },
      { latitude: toLatitude, longitude: toLongitude }
    );
  }, [latestGpsLog, previousGpsLog]);

  const truckMarkerIcon = useMemo(() => createTruckMarkerIcon(heading), [heading]);

  const speedKmph = Number.isFinite(Number(latestGpsLog?.speed)) ? Number(latestGpsLog.speed) : 0;

  const estimatedArrivalDate = useMemo(() => {
    const arrivedStep = timeline.find((step) => step.label === "Arrived" && step.timestamp);
    if (arrivedStep?.timestamp) {
      return new Date(arrivedStep.timestamp);
    }

    const dispatchedStep = timeline.find((step) => step.label === "Dispatched" && step.timestamp);
    if (dispatchedStep?.timestamp) {
      const etaDate = new Date(dispatchedStep.timestamp);
      etaDate.setDate(etaDate.getDate() + 3);
      return etaDate;
    }

    return DEFAULT_ETA;
  }, [timeline]);

  const estimatedArrivalText = estimatedArrivalDate.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric"
  });

  const displayGpsLogs = showFullHistory ? recentGpsLogs : recentGpsLogs.slice(0, 5);

  const driverName = tracking?.vehicle?.driverName || "Suresh Yadav";
  const driverPhone = tracking?.vehicle?.driverPhone || "";
  const driverInitials = driverName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusToneClass =
    tracking?.status === "Delivered"
      ? "bg-emerald-600 text-white"
      : tracking?.status === "Arrived"
        ? "bg-indigo-600 text-white"
        : tracking?.status === "Dispatched"
          ? "bg-blue-600 text-white"
          : "bg-slate-700 text-white";

  return (
    <section className="mx-auto w-full max-w-[1440px] space-y-4">
      <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] sm:px-6">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Tracking Control Tower</h2>
          <p className="text-sm text-slate-500">Live dispatch intelligence for LR-linked shipments.</p>
        </div>
      </header>

      {loading && !tracking ? <LoadingSpinner label={t("common.loading")} /> : null}
      {error ? <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">{error}</p> : null}

      {!hasSearchedLr && !tracking ? (
        <div className="grid min-h-[68vh] place-items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] sm:p-10">
          <div className="w-full max-w-3xl text-center">
            <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M3 16V8a2 2 0 0 1 2-2h10v10H3Z" />
                <path d="M15 10h3l3 3v3h-6" />
                <circle cx="7.5" cy="18" r="2" />
                <circle cx="17.5" cy="18" r="2" />
              </svg>
            </div>
            <h3 className="font-heading text-3xl font-bold tracking-tight text-slate-900">Track Any LR Instantly</h3>
            <p className="mt-2 text-base text-slate-500">Enter the LR number to launch command view with status, map, and activity feed.</p>

            <form className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={onTrack}>
              <input
                value={lrNumber}
                onChange={(event) => setLrNumber(event.target.value)}
                placeholder={t("customer.enterLr")}
                className="h-14 rounded-2xl border border-slate-300 bg-white px-4 text-base font-medium text-slate-800 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
                required
              />
              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {t("customer.trackNow")}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {tracking ? (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(360px,0.4fr)_minmax(540px,0.6fr)]">
          <aside className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] sm:p-5 xl:sticky xl:top-[84px] xl:z-10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Current Shipment</p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-slate-900">Shipment: {tracking.lrNumber || "-"}</h3>
                </div>
                <span className={`rounded-xl px-3 py-1 text-xs font-bold tracking-[0.08em] ${statusToneClass}`}>
                  {(tracking.status || "DISPATCHED").toUpperCase()}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                {tracking.booking?.sourceCity || "-"} to {tracking.booking?.destinationCity || "-"}
              </p>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {driverInitials || "SY"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{driverName}</p>
                      <p className="text-xs text-slate-500">{tracking.vehicle?.vehicleNumber || "Vehicle pending"}</p>
                    </div>
                  </div>
                  {driverPhone ? (
                    <a
                      href={`tel:${driverPhone}`}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Call Driver
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-400"
                    >
                      Call Driver
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">Estimated Arrival</p>
                <p className="mt-1 text-sm font-semibold text-blue-900">{estimatedArrivalText}</p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] sm:p-5">
              <h3 className="font-heading text-lg font-semibold text-slate-900">Active Timeline</h3>

              <ol className="relative mt-4 space-y-4 border-l-2 border-slate-200 pl-6">
                {timeline.map((step) => {
                  const stepCompleted = Boolean(step.completed);

                  return (
                    <li key={step.label} className="relative">
                      <span
                        className={`absolute -left-[34px] top-1 inline-flex h-4 w-4 items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                          stepCompleted
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-slate-100 text-transparent"
                        }`}
                      >
                        {stepCompleted ? "✓" : "-"}
                      </span>
                      <p className={`text-sm font-semibold ${stepCompleted ? "text-slate-900" : "text-slate-500"}`}>
                        {t(`status.${step.label}`, step.label)}
                      </p>
                      <p className="text-xs text-slate-500">{formatTimestamp(step.timestamp)}</p>
                    </li>
                  );
                })}
              </ol>
            </article>
          </aside>

          <div className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-heading text-lg font-semibold text-slate-900">Command Map</h3>
                <div className="flex items-center gap-2">
                  {hasValidLocation ? (
                    <a
                      href={mapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      {t("customer.openInMap")}
                    </a>
                  ) : null}
                  <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Live</span>
                </div>
              </div>

              {hasValidLocation ? (
                <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200">
                  <MapContainer
                    center={[latitude, longitude]}
                    zoom={7}
                    scrollWheelZoom
                    className="control-tower-map h-[60vh] min-h-[500px] w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; Carto'
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={[latitude, longitude]} icon={truckMarkerIcon}>
                      <Popup>
                        {tracking.vehicle?.vehicleNumber || "Vehicle"}<br />
                        {latitude.toFixed(4)}, {longitude.toFixed(4)}
                      </Popup>
                    </Marker>
                  </MapContainer>

                  <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-white/70 bg-white/85 px-3 py-2 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Current Speed</p>
                    <p className="text-sm font-bold text-slate-900">{speedKmph} km/h</p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500">{t("customer.locationUnavailable")}</p>
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1)] sm:p-5">
              <h3 className="font-heading text-lg font-semibold text-slate-900">Vehicle Metrics & Activity Feed</h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Speed</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{speedKmph} km/h</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Last Update</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{formatTimestamp(latestGpsLog?.recordedAt || tracking.currentLocation?.updatedAt)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Status</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{(tracking.status || "-").toUpperCase()}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {displayGpsLogs.map((log) => {
                  const logLatitude = parseCoordinate(log.latitude);
                  const logLongitude = parseCoordinate(log.longitude);
                  const logSpeed = Number.isFinite(Number(log.speed)) ? Number(log.speed) : 0;

                  const landmarkLabel =
                    logLatitude !== null && logLongitude !== null
                      ? getLandmarkLabel(logLatitude, logLongitude)
                      : "an active transit corridor";

                  return (
                    <article key={`${log.recordedAt}-${log.latitude}-${log.longitude}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-sm text-slate-700">
                        <span className="mr-1.5">📍</span>
                        {formatFeedTime(log.recordedAt)}: Vehicle passed {landmarkLabel} at {logSpeed} km/h.
                      </p>
                    </article>
                  );
                })}

                {displayGpsLogs.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    No GPS activity available yet.
                  </p>
                ) : null}
              </div>

              {recentGpsLogs.length > 5 ? (
                <button
                  type="button"
                  className="mt-3 text-sm font-semibold text-blue-700 underline-offset-2 transition hover:text-blue-800 hover:underline"
                  onClick={() => setShowFullHistory((previous) => !previous)}
                >
                  {showFullHistory ? "Show Less" : "View Full History"}
                </button>
              ) : null}
            </article>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default TrackingPage;
