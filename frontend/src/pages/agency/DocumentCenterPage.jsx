import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";

const cardClassName = "rounded-xl border border-brand-border bg-white p-6 shadow-card";
const formGridClassName = "grid grid-cols-1 gap-4 md:grid-cols-2";
const fieldWrapClassName = "mb-4 block";
const labelClassName = "mb-1.5 block text-sm font-medium text-slate-600";
const controlClassName =
  "w-full border border-brand-border px-4 py-2 rounded-lg bg-white text-sm text-brand-secondary outline-none ring-brand-primary/20 focus:ring-4";
const buttonClassName =
  "w-full mt-4 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 md:col-span-2";

function DocumentCenterPage() {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: "",
    driverName: "",
    driverPhone: ""
  });

  const [lrForm, setLrForm] = useState({
    bookingId: "",
    consignorName: "",
    consigneeName: "",
    freightAmount: ""
  });

  const [dispatchForm, setDispatchForm] = useState({
    lrId: "",
    vehicleId: "",
    vehicleNumber: "",
    driverName: "",
    driverPhone: "",
    initialLatitude: "",
    initialLongitude: ""
  });

  const [arrivalForm, setArrivalForm] = useState({
    lrId: "",
    hubLocation: "",
    remarks: ""
  });

  const [deliveryForm, setDeliveryForm] = useState({
    lrId: "",
    recipientName: "",
    recipientPhone: "",
    proofOfDelivery: ""
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [{ data: bookingData }, { data: vehicleData }] = await Promise.all([
        axiosClient.get("/booking/agency"),
        axiosClient.get("/vehicle")
      ]);

      setBookings(bookingData.bookings || []);
      setVehicles(vehicleData.vehicles || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const bookingWithoutLr = useMemo(() => bookings.filter((item) => !item.lr), [bookings]);
  const bookedWithLr = useMemo(() => bookings.filter((item) => item.lr && item.status === "Booked"), [bookings]);
  const dispatched = useMemo(() => bookings.filter((item) => item.lr && item.status === "Dispatched"), [bookings]);
  const arrived = useMemo(() => bookings.filter((item) => item.lr && item.status === "Arrived"), [bookings]);

  const showSuccess = (text) => {
    setMessage(text);
    setError("");
  };

  const submitVehicle = async (event) => {
    event.preventDefault();
    try {
      await axiosClient.post("/vehicle/create", vehicleForm);
      setVehicleForm({ vehicleNumber: "", driverName: "", driverPhone: "" });
      showSuccess("Vehicle added successfully");
      await loadData();
    } catch (submitError) {
      setError(submitError.message);
      setMessage("");
    }
  };

  const submitLr = async (event) => {
    event.preventDefault();
    try {
      await axiosClient.post("/lr/create", {
        ...lrForm,
        freightAmount: Number(lrForm.freightAmount)
      });
      setLrForm({ bookingId: "", consignorName: "", consigneeName: "", freightAmount: "" });
      showSuccess("LR generated successfully");
      await loadData();
    } catch (submitError) {
      setError(submitError.message);
      setMessage("");
    }
  };

  const submitDispatch = async (event) => {
    event.preventDefault();

    const payload = {
      lrId: dispatchForm.lrId
    };

    const trimmedVehicleId = dispatchForm.vehicleId.trim();
    const trimmedVehicleNumber = dispatchForm.vehicleNumber.trim();
    const trimmedDriverName = dispatchForm.driverName.trim();
    const trimmedDriverPhone = dispatchForm.driverPhone.trim();
    const trimmedInitialLatitude = dispatchForm.initialLatitude.trim();
    const trimmedInitialLongitude = dispatchForm.initialLongitude.trim();

    if (trimmedVehicleId) {
      payload.vehicleId = trimmedVehicleId;
    }

    if (trimmedVehicleNumber) {
      payload.vehicleNumber = trimmedVehicleNumber;
    }

    if (trimmedDriverName) {
      payload.driverName = trimmedDriverName;
    }

    if (trimmedDriverPhone) {
      payload.driverPhone = trimmedDriverPhone;
    }

    if (trimmedInitialLatitude) {
      const parsedLatitude = Number(trimmedInitialLatitude);
      if (!Number.isFinite(parsedLatitude)) {
        setError("Initial latitude must be a valid number");
        setMessage("");
        return;
      }
      payload.initialLatitude = parsedLatitude;
    }

    if (trimmedInitialLongitude) {
      const parsedLongitude = Number(trimmedInitialLongitude);
      if (!Number.isFinite(parsedLongitude)) {
        setError("Initial longitude must be a valid number");
        setMessage("");
        return;
      }
      payload.initialLongitude = parsedLongitude;
    }

    try {
      await axiosClient.post("/dispatch/create", payload);
      setDispatchForm({
        lrId: "",
        vehicleId: "",
        vehicleNumber: "",
        driverName: "",
        driverPhone: "",
        initialLatitude: "",
        initialLongitude: ""
      });
      showSuccess("Dispatch challan created");
      await loadData();
    } catch (submitError) {
      setError(submitError.message);
      setMessage("");
    }
  };

  const submitArrival = async (event) => {
    event.preventDefault();
    try {
      await axiosClient.post("/arrival/create", arrivalForm);
      setArrivalForm({ lrId: "", hubLocation: "", remarks: "" });
      showSuccess("Arrival challan created");
      await loadData();
    } catch (submitError) {
      setError(submitError.message);
      setMessage("");
    }
  };

  const submitDelivery = async (event) => {
    event.preventDefault();
    try {
      await axiosClient.post("/delivery/create", deliveryForm);
      setDeliveryForm({ lrId: "", recipientName: "", recipientPhone: "", proofOfDelivery: "" });
      showSuccess("Delivery recorded successfully");
      await loadData();
    } catch (submitError) {
      setError(submitError.message);
      setMessage("");
    }
  };

  if (loading) {
    return <LoadingSpinner label={t("common.loading")} />;
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="typo-page-title">{t("agency.documentTitle")}</h2>
      </header>

      {error ? (
        <p className="rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-2 text-sm text-status-failed">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-status-delivered/30 bg-status-delivered/10 px-4 py-2 text-sm text-status-delivered">
          {message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className={cardClassName}>
          <h3 className="typo-card-title mb-4">{t("agency.createVehicle")}</h3>
          <form className={formGridClassName} onSubmit={submitVehicle}>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Vehicle Number</span>
              <input
                className={controlClassName}
                name="vehicleNumber"
                value={vehicleForm.vehicleNumber}
                onChange={(event) => setVehicleForm((prev) => ({ ...prev, vehicleNumber: event.target.value }))}
                required
              />
            </label>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Driver Name</span>
              <input
                className={controlClassName}
                name="driverName"
                value={vehicleForm.driverName}
                onChange={(event) => setVehicleForm((prev) => ({ ...prev, driverName: event.target.value }))}
                required
              />
            </label>
            <label className={`${fieldWrapClassName} md:col-span-2`}>
              <span className={labelClassName}>Driver Phone</span>
              <input
                className={controlClassName}
                name="driverPhone"
                value={vehicleForm.driverPhone}
                onChange={(event) => setVehicleForm((prev) => ({ ...prev, driverPhone: event.target.value }))}
              />
            </label>
            <button className={buttonClassName} type="submit">
              Add Vehicle
            </button>
          </form>
        </article>

        <article className={cardClassName}>
          <h3 className="typo-card-title mb-4">{t("agency.createLr")}</h3>
          <form className={formGridClassName} onSubmit={submitLr}>
            <label className={`${fieldWrapClassName} md:col-span-2`}>
              <span className={labelClassName}>Booking</span>
              <select
                className={controlClassName}
                value={lrForm.bookingId}
                onChange={(event) => setLrForm((prev) => ({ ...prev, bookingId: event.target.value }))}
                required
              >
                <option value="">{t("common.select")}</option>
                {bookingWithoutLr.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.sourceCity} to {booking.destinationCity}
                  </option>
                ))}
              </select>
            </label>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Consignor Name</span>
              <input
                className={controlClassName}
                value={lrForm.consignorName}
                onChange={(event) => setLrForm((prev) => ({ ...prev, consignorName: event.target.value }))}
                required
              />
            </label>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Consignee Name</span>
              <input
                className={controlClassName}
                value={lrForm.consigneeName}
                onChange={(event) => setLrForm((prev) => ({ ...prev, consigneeName: event.target.value }))}
                required
              />
            </label>
            <label className={`${fieldWrapClassName} md:col-span-2`}>
              <span className={labelClassName}>Freight Amount</span>
              <input
                className={controlClassName}
                type="number"
                min="1"
                value={lrForm.freightAmount}
                onChange={(event) => setLrForm((prev) => ({ ...prev, freightAmount: event.target.value }))}
                required
              />
            </label>
            <button className={buttonClassName} type="submit">
              Generate LR
            </button>
          </form>
        </article>

        <article className={cardClassName}>
          <h3 className="typo-card-title mb-4">{t("agency.createDispatch")}</h3>
          <form className={formGridClassName} onSubmit={submitDispatch}>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>LR</span>
              <select
                className={controlClassName}
                value={dispatchForm.lrId}
                onChange={(event) => setDispatchForm((prev) => ({ ...prev, lrId: event.target.value }))}
                required
              >
                <option value="">{t("common.select")}</option>
                {bookedWithLr.map((booking) => (
                  <option key={booking.lr._id} value={booking.lr._id}>
                    {booking.lr.lrNumber}
                  </option>
                ))}
              </select>
            </label>

            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Existing Vehicle</span>
              <select
                className={controlClassName}
                value={dispatchForm.vehicleId}
                onChange={(event) => setDispatchForm((prev) => ({ ...prev, vehicleId: event.target.value }))}
              >
                <option value="">{t("common.select")}</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.vehicleNumber}
                  </option>
                ))}
              </select>
            </label>

            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Or Vehicle Number</span>
              <input
                className={controlClassName}
                value={dispatchForm.vehicleNumber}
                onChange={(event) => setDispatchForm((prev) => ({ ...prev, vehicleNumber: event.target.value }))}
              />
            </label>

            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Driver Name</span>
              <input
                className={controlClassName}
                value={dispatchForm.driverName}
                onChange={(event) => setDispatchForm((prev) => ({ ...prev, driverName: event.target.value }))}
              />
            </label>

            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Driver Phone</span>
              <input
                className={controlClassName}
                value={dispatchForm.driverPhone}
                onChange={(event) => setDispatchForm((prev) => ({ ...prev, driverPhone: event.target.value }))}
              />
            </label>

            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Initial Latitude</span>
              <input
                className={controlClassName}
                type="number"
                step="any"
                min="-90"
                max="90"
                value={dispatchForm.initialLatitude}
                onChange={(event) => setDispatchForm((prev) => ({ ...prev, initialLatitude: event.target.value }))}
              />
            </label>

            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Initial Longitude</span>
              <input
                className={controlClassName}
                type="number"
                step="any"
                min="-180"
                max="180"
                value={dispatchForm.initialLongitude}
                onChange={(event) => setDispatchForm((prev) => ({ ...prev, initialLongitude: event.target.value }))}
              />
            </label>

            <button className={buttonClassName} type="submit">
              Create Dispatch
            </button>
          </form>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className={cardClassName}>
          <h3 className="typo-card-title mb-4">{t("agency.createArrival")}</h3>
          <form className={formGridClassName} onSubmit={submitArrival}>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>LR</span>
              <select
                className={controlClassName}
                value={arrivalForm.lrId}
                onChange={(event) => setArrivalForm((prev) => ({ ...prev, lrId: event.target.value }))}
                required
              >
                <option value="">{t("common.select")}</option>
                {dispatched.map((booking) => (
                  <option key={booking.lr._id} value={booking.lr._id}>
                    {booking.lr.lrNumber}
                  </option>
                ))}
              </select>
            </label>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Hub Location</span>
              <input
                className={controlClassName}
                value={arrivalForm.hubLocation}
                onChange={(event) => setArrivalForm((prev) => ({ ...prev, hubLocation: event.target.value }))}
                required
              />
            </label>
            <label className={`${fieldWrapClassName} md:col-span-2`}>
              <span className={labelClassName}>Remarks</span>
              <input
                className={controlClassName}
                value={arrivalForm.remarks}
                onChange={(event) => setArrivalForm((prev) => ({ ...prev, remarks: event.target.value }))}
              />
            </label>
            <button className={buttonClassName} type="submit">
              Create Arrival
            </button>
          </form>
        </article>

        <article className={cardClassName}>
          <h3 className="typo-card-title mb-4">{t("agency.createDelivery")}</h3>
          <form className={formGridClassName} onSubmit={submitDelivery}>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>LR</span>
              <select
                className={controlClassName}
                value={deliveryForm.lrId}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, lrId: event.target.value }))}
                required
              >
                <option value="">{t("common.select")}</option>
                {arrived.map((booking) => (
                  <option key={booking.lr._id} value={booking.lr._id}>
                    {booking.lr.lrNumber}
                  </option>
                ))}
              </select>
            </label>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Recipient Name</span>
              <input
                className={controlClassName}
                value={deliveryForm.recipientName}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, recipientName: event.target.value }))}
                required
              />
            </label>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Recipient Phone</span>
              <input
                className={controlClassName}
                value={deliveryForm.recipientPhone}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, recipientPhone: event.target.value }))}
              />
            </label>
            <label className={fieldWrapClassName}>
              <span className={labelClassName}>Proof of Delivery</span>
              <input
                className={controlClassName}
                value={deliveryForm.proofOfDelivery}
                onChange={(event) => setDeliveryForm((prev) => ({ ...prev, proofOfDelivery: event.target.value }))}
              />
            </label>
            <button className={buttonClassName} type="submit">
              Complete Delivery
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}

export default DocumentCenterPage;
