import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusTimeline from "../../components/StatusTimeline";

const toTimeline = (status, createdAt) => {
  const statusOrder = ["Booked", "Dispatched", "Arrived", "Delivered"];
  const currentIndex = statusOrder.indexOf(status);

  return statusOrder.map((label, index) => ({
    label,
    completed: index <= currentIndex,
    timestamp: index === 0 ? createdAt : null
  }));
};

function CustomerDashboard() {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axiosClient.get("/booking/user");
        setBookings(data.bookings || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  return (
    <section className="space-y-5">
      <header className="section-head">
        <h2 className="typo-page-title">{t("customer.dashboardTitle")}</h2>
      </header>

      {loading ? <LoadingSpinner label={t("common.loading")} /> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="stack-list">
        {bookings.map((booking) => (
          <article key={booking._id} className="surface-card">
            <div className="split-row">
              <div>
                <h3 className="typo-card-title">
                  {booking.sourceCity} to {booking.destinationCity}
                </h3>
                <p className="typo-body">{booking.goodsDescription}</p>
                <p className="typo-helper">
                  Agency: {booking.agency?.agencyName || "-"} | LR: {booking.lr?.lrNumber || "Pending"}
                </p>
              </div>
              <span className={`status-pill ${booking.status.toLowerCase()}`}>{t(`status.${booking.status}`)}</span>
            </div>
            <StatusTimeline timeline={toTimeline(booking.status, booking.createdAt)} />
          </article>
        ))}
      </div>

      {!loading && bookings.length === 0 ? (
        <p className="typo-body">No bookings yet. Create your first shipment booking.</p>
      ) : null}
    </section>
  );
}

export default CustomerDashboard;
