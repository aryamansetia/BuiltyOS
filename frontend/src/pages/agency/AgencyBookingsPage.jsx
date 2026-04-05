import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import FilterTabs from "../../components/agency/bookings/FilterTabs";
import IncomingBookingsTable from "../../components/agency/bookings/IncomingBookingsTable";
import SearchBar from "../../components/agency/bookings/SearchBar";
import LoadingSpinner from "../../components/LoadingSpinner";

const statusTabLabels = ["All", "Booked", "Dispatched", "Delivered"];
const pageSize = 8;

function AgencyBookingsPage() {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [expandedBookingId, setExpandedBookingId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadBookings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const tabCounts = useMemo(
    () => ({
      All: bookings.length,
      Booked: bookings.filter((booking) => booking.status === "Booked").length,
      Dispatched: bookings.filter((booking) => booking.status === "Dispatched").length,
      Delivered: bookings.filter((booking) => booking.status === "Delivered").length
    }),
    [bookings]
  );

  const tabs = useMemo(
    () => statusTabLabels.map((label) => ({ label, count: tabCounts[label] || 0 })),
    [tabCounts]
  );

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus = activeTab === "All" ? true : booking.status === activeTab;
      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const route = `${booking.sourceCity || ""} ${booking.destinationCity || ""}`.toLowerCase();
      const customer = (booking.customer?.fullName || "").toLowerCase();
      const lrNumber = (booking.lr?.lrNumber || "").toLowerCase();
      const goods = (booking.goodsDescription || "").toLowerCase();

      return route.includes(normalizedSearch) || customer.includes(normalizedSearch) || lrNumber.includes(normalizedSearch) || goods.includes(normalizedSearch);
    });
  }, [activeTab, bookings, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBookings.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredBookings]);

  const onCreateBooking = () => {
    setFeedback("Bookings are currently created by customers from the customer portal.");
    setError("");
  };

  const onSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const onTabChange = (tabLabel) => {
    setActiveTab(tabLabel);
    setExpandedBookingId("");
    setCurrentPage(1);
  };

  const onRowClick = (bookingId) => {
    setExpandedBookingId((prev) => (prev === bookingId ? "" : bookingId));
  };

  const onGenerateLr = async (booking) => {
    if (booking.lr?.lrNumber) {
      setFeedback("LR is already generated for this booking.");
      return;
    }

    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      await axiosClient.post("/lr/create", {
        bookingId: booking._id,
        freightAmount: booking.estimatedPrice,
        consignorName: booking.customer?.fullName || "Customer",
        consigneeName: booking.customer?.fullName || "Customer"
      });

      setFeedback("LR generated successfully.");
      await loadBookings();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDispatch = async (booking) => {
    if (!booking.lr?._id) {
      setFeedback("Generate LR first before dispatching this booking.");
      return;
    }

    if (booking.status !== "Booked") {
      setFeedback(`Dispatch is only available for booked shipments. Current status is ${booking.status}.`);
      return;
    }

    const vehicleNumber = window.prompt("Enter vehicle number for dispatch:");
    if (!vehicleNumber?.trim()) {
      return;
    }

    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      await axiosClient.post("/dispatch/create", {
        lrId: booking.lr._id,
        vehicleNumber: vehicleNumber.trim()
      });

      setFeedback("Dispatch created successfully.");
      await loadBookings();
    } catch (dispatchError) {
      setError(dispatchError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = () => {
    setFeedback("Delete action is not enabled in this build yet.");
  };

  const canShowPagination = filteredBookings.length > pageSize;

  return (
    <section className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Incoming Booking Management</h1>
        <p className="text-gray-500 text-sm">Manage and track all incoming shipment bookings</p>
      </header>

      <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} onCreateBooking={onCreateBooking} />
      <FilterTabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />

      {loading ? <LoadingSpinner label={t("common.loading")} /> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {feedback ? <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">{feedback}</p> : null}

      {!loading && filteredBookings.length > 0 ? (
        <IncomingBookingsTable
          bookings={visibleBookings}
          expandedBookingId={expandedBookingId}
          onRowClick={onRowClick}
          onGenerateLr={onGenerateLr}
          onDispatch={onDispatch}
          onDelete={onDelete}
        />
      ) : null}

      {!loading && filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-base font-semibold text-slate-800">No bookings found</p>
          <button
            type="button"
            onClick={onCreateBooking}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-105"
          >
            + Create Booking
          </button>
        </div>
      ) : null}

      {!loading && canShowPagination ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || submitting}
            className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>

          <p className="font-medium">
            Page {currentPage} of {totalPages}
          </p>

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || submitting}
            className="rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}

    </section>
  );
}

export default AgencyBookingsPage;
