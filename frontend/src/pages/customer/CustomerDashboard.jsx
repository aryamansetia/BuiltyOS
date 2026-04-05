import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";

const dateRangeOptions = [
  { value: "all", label: "Date Range" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "year", label: "This Year" }
];

const statusOptions = ["All", "Booked", "Dispatched", "Arrived", "Delivered"];

const formatCreatedDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
};

const matchesDateRange = (createdAt, rangeValue) => {
  if (rangeValue === "all") {
    return true;
  }

  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) {
    return false;
  }

  const now = new Date();
  if (rangeValue === "year") {
    return createdDate.getFullYear() === now.getFullYear();
  }

  const dayCount = Number(rangeValue.replace("d", ""));
  if (!Number.isFinite(dayCount)) {
    return true;
  }

  const thresholdTime = now.getTime() - dayCount * 24 * 60 * 60 * 1000;
  return createdDate.getTime() >= thresholdTime;
};

function CustomerDashboard() {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

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

  const isSessionError = useMemo(() => {
    if (!error) {
      return false;
    }

    const normalizedError = error.toLowerCase();
    return ["token", "expired", "authorized", "forbidden", "permission"].some((keyword) =>
      normalizedError.includes(keyword)
    );
  }, [error]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (statusFilter !== "All" && booking.status !== statusFilter) {
        return false;
      }

      if (!matchesDateRange(booking.createdAt, dateRangeFilter)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const routeLabel = `${booking.sourceCity || ""} ${booking.destinationCity || ""}`.toLowerCase();
      const lrNumber = (booking.lr?.lrNumber || "").toLowerCase();

      return routeLabel.includes(normalizedSearch) || lrNumber.includes(normalizedSearch);
    });
  }, [bookings, dateRangeFilter, searchTerm, statusFilter]);

  return (
    <section className="space-y-5">
      <header className="section-head">
        <h2 className="typo-page-title">{t("customer.dashboardTitle")}</h2>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_200px_180px]">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Search by LR or Route</span>
            <input
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
              placeholder="Search by LR or Route"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Filter by Status</span>
            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none ring-blue-200 focus:ring-2"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption === "All" ? "Filter by Status" : t(`status.${statusOption}`, statusOption)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Date Range</span>
            <select
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none ring-blue-200 focus:ring-2"
              value={dateRangeFilter}
              onChange={(event) => setDateRangeFilter(event.target.value)}
            >
              {dateRangeOptions.map((dateOption) => (
                <option key={dateOption.value} value={dateOption.value}>
                  {dateOption.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {loading ? <LoadingSpinner label={t("common.loading")} /> : null}

      {error && !isSessionError ? (
        <article className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          <p className="font-semibold">Unable to load shipment history right now.</p>
          <p className="mt-1">Please refresh the page and try again.</p>
        </article>
      ) : null}

      <div className="stack-list">
        {filteredBookings.map((booking) => {
          const bookingLink = booking.lr?.lrNumber
            ? `/tracking?lrNumber=${encodeURIComponent(booking.lr.lrNumber)}`
            : "/tracking";

          return (
            <article
              key={booking._id}
              className="max-h-[100px] overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="min-w-0 basis-[38%]">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {booking.sourceCity} to {booking.destinationCity}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">Created: {formatCreatedDate(booking.createdAt)}</p>
                </div>

                <div className="grid min-w-0 basis-[40%] grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">LR Number</p>
                    {booking.lr?.lrNumber ? (
                      <Link to={bookingLink} className="truncate text-sm font-semibold text-blue-600 underline-offset-2 hover:underline">
                        {booking.lr.lrNumber}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-semibold text-slate-400">Pending</p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Agency</p>
                    <p className="truncate text-sm font-semibold text-slate-700">{booking.agency?.agencyName || "-"}</p>
                  </div>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <span className={`status-pill ${booking.status.toLowerCase()}`}>{t(`status.${booking.status}`)}</span>
                  <Link to={bookingLink} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    View Details
                    <span aria-hidden="true">&gt;</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && !error && bookings.length > 0 && filteredBookings.length === 0 ? (
        <article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-700">No shipments match your current filters.</p>
          <p className="mt-1 text-sm text-slate-500">Try changing status, date range, or search query.</p>
        </article>
      ) : null}

      {!loading && !error && bookings.length === 0 ? (
        <article className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-700">No bookings yet.</p>
          <p className="mt-1 text-sm text-slate-500">Create your first shipment booking to start building history.</p>
        </article>
      ) : null}

      {isSessionError ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-4 backdrop-blur-[1px]">
          <article className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">Session Expired</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your login session has ended. Please sign in again to continue viewing shipment history.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setError("")}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
              <Link
                to="/login"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Go to Login
              </Link>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

export default CustomerDashboard;
