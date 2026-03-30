import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";

function AgencyBookingsPage() {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await axiosClient.get("/booking/agency");
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
    <section>
      <header className="section-head">
        <h2>{t("agency.bookingTitle")}</h2>
      </header>

      {loading ? <LoadingSpinner label={t("common.loading")} /> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Route</th>
              <th>Goods</th>
              <th>Weight</th>
              <th>LR</th>
              <th>{t("common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.customer?.fullName || "-"}</td>
                <td>
                  {booking.sourceCity} to {booking.destinationCity}
                </td>
                <td>{booking.goodsDescription}</td>
                <td>{booking.weightKg} kg</td>
                <td>{booking.lr?.lrNumber || "Pending"}</td>
                <td>
                  <span className={`status-pill ${booking.status.toLowerCase()}`}>{t(`status.${booking.status}`)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && bookings.length === 0 ? <p>No agency bookings yet.</p> : null}
    </section>
  );
}

export default AgencyBookingsPage;
