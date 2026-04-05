import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";
import ActionBar from "../../components/agency/ActionBar";
import ActivityFeed from "../../components/agency/ActivityFeed";
import KpiCard from "../../components/agency/KpiCard";
import OperationsPanel from "../../components/agency/OperationsPanel";
import ProfileCard from "../../components/agency/ProfileCard";
import RouteManagementCard from "../../components/agency/RouteManagementCard";

const initialStats = {
  totalBookings: 0,
  delivered: 0,
  inTransit: 0
};

const initialProfileForm = {
  agencyName: "",
  city: "",
  gstNumber: "",
  contactNumber: ""
};

const initialRouteForm = {
  from: "",
  to: "",
  basePricePerKg: "",
  estimatedDays: ""
};

const formatActivityTime = (value) => {
  if (!value) {
    return "Recently";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return parsedDate.toLocaleString([], {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M9 3h6" />
    <path d="M9 3a2 2 0 0 0-2 2v1H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1V5a2 2 0 0 0-2-2" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M1 3h15v13H1z" />
    <path d="M16 8h4l3 3v5h-7z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

function AgencyDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [agency, setAgency] = useState(null);
  const [stats, setStats] = useState(initialStats);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [routeForm, setRouteForm] = useState(initialRouteForm);
  const [editingRouteId, setEditingRouteId] = useState("");
  const [routeSubmitting, setRouteSubmitting] = useState(false);

  const routeSectionRef = useRef(null);
  const routeFromInputRef = useRef(null);

  const showSuccess = (text) => {
    setMessage(text);
    setError("");
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [{ data: agencyData }, { data: statsData }, { data: bookingsData }] = await Promise.all([
        axiosClient.get("/agency/me"),
        axiosClient.get("/booking/agency/stats"),
        axiosClient.get("/booking/agency")
      ]);

      setAgency(agencyData.agency);
      setStats(statsData || initialStats);
      setBookings(bookingsData.bookings || []);
    } catch (loadError) {
      if ((loadError.message || "").toLowerCase().includes("not found")) {
        setAgency(null);
        setStats(initialStats);
        setBookings([]);
      } else {
        setError(loadError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const onRouteChange = (event) => {
    const { name, value } = event.target;
    setRouteForm((prev) => ({ ...prev, [name]: value }));
  };

  const createProfile = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await axiosClient.post("/agency/create", profileForm);
      setProfileForm(initialProfileForm);
      showSuccess("Agency profile created successfully.");
      await loadDashboard();
    } catch (submitError) {
      setError(submitError.message);
      setMessage("");
    }
  };

  const resetRouteForm = () => {
    setRouteForm(initialRouteForm);
    setEditingRouteId("");
  };

  const addRoute = async (event) => {
    event.preventDefault();
    setRouteSubmitting(true);
    setError("");

    const payload = {
      ...routeForm,
      basePricePerKg: Number(routeForm.basePricePerKg),
      estimatedDays: Number(routeForm.estimatedDays || 1)
    };

    try {
      if (editingRouteId) {
        await axiosClient.patch(`/agency/route/${editingRouteId}`, payload);
        showSuccess("Route updated successfully.");
      } else {
        await axiosClient.post("/agency/route", payload);
        showSuccess("Route added successfully.");
      }

      resetRouteForm();
      await loadDashboard();
    } catch (submitError) {
      setError(submitError.message);
      setMessage("");
    } finally {
      setRouteSubmitting(false);
    }
  };

  const onEditRoute = (route) => {
    setRouteForm({
      from: route.from || "",
      to: route.to || "",
      basePricePerKg: route.basePricePerKg || "",
      estimatedDays: route.estimatedDays || ""
    });
    setEditingRouteId(route._id);

    routeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => routeFromInputRef.current?.focus(), 220);
  };

  const onDeleteRoute = async (routeId) => {
    const confirmDelete = window.confirm("Delete this route?");
    if (!confirmDelete) {
      return;
    }

    setRouteSubmitting(true);
    setError("");

    try {
      await axiosClient.delete(`/agency/route/${routeId}`);
      if (editingRouteId === routeId) {
        resetRouteForm();
      }
      showSuccess("Route deleted successfully.");
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError.message);
      setMessage("");
    } finally {
      setRouteSubmitting(false);
    }
  };

  const onGenerateLr = () => {
    navigate("/agency/documents");
  };

  const onAddRouteAction = () => {
    if (!agency) {
      return;
    }

    routeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => routeFromInputRef.current?.focus(), 220);
  };

  const onEditProfile = () => {
    showSuccess("Profile settings module is coming soon.");
  };

  const kpiItems = [
    {
      key: "total-bookings",
      label: "Total Bookings",
      value: stats.totalBookings,
      toneClass: "bg-blue-100 text-blue-600",
      icon: <ClipboardIcon />
    },
    {
      key: "in-transit",
      label: "In Transit",
      value: stats.inTransit,
      toneClass: "bg-amber-100 text-amber-600",
      icon: <TruckIcon />
    },
    {
      key: "delivered",
      label: "Delivered",
      value: stats.delivered,
      toneClass: "bg-emerald-100 text-emerald-600",
      icon: <CheckCircleIcon />
    }
  ];

  const activityItems = useMemo(() => {
    const items = [];
    const sortedBookings = [...bookings].sort(
      (left, right) => new Date(right.updatedAt || right.createdAt).getTime() - new Date(left.updatedAt || left.createdAt).getTime()
    );

    const lrGeneratedBooking = sortedBookings.find((booking) => booking.lr?.lrNumber);
    if (lrGeneratedBooking) {
      items.push({
        id: `lr-${lrGeneratedBooking._id}`,
        text: `LR generated for ${lrGeneratedBooking.sourceCity} to ${lrGeneratedBooking.destinationCity}`,
        meta: `LR ${lrGeneratedBooking.lr.lrNumber} on ${formatActivityTime(lrGeneratedBooking.updatedAt || lrGeneratedBooking.createdAt)}`
      });
    }

    const deliveredBooking = sortedBookings.find((booking) => booking.status === "Delivered");
    if (deliveredBooking) {
      items.push({
        id: `delivered-${deliveredBooking._id}`,
        text: `Shipment delivered for ${deliveredBooking.sourceCity} to ${deliveredBooking.destinationCity}`,
        meta: `Delivered at ${formatActivityTime(deliveredBooking.updatedAt || deliveredBooking.createdAt)}`
      });
    }

    const latestRoute = agency?.routes?.[agency.routes.length - 1];
    if (latestRoute) {
      items.push({
        id: `route-${latestRoute._id}`,
        text: `New route added: ${latestRoute.from} to ${latestRoute.to}`,
        meta: `Rate set at INR ${latestRoute.basePricePerKg}/kg`
      });
    }

    if (!items.length) {
      items.push({
        id: "empty-state",
        text: "No recent operations yet.",
        meta: "Use the action bar above to create shipments, generate LR, or add routes."
      });
    }

    return items.slice(0, 4);
  }, [agency?.routes, bookings]);

  const operationsSnapshot = useMemo(
    () => ({
      booked: bookings.filter((booking) => booking.status === "Booked").length,
      lrPending: bookings.filter((booking) => !booking.lr?.lrNumber).length,
      inTransit: stats.inTransit || 0,
      delivered: stats.delivered || 0
    }),
    [bookings, stats.delivered, stats.inTransit]
  );

  if (loading) {
    return <LoadingSpinner label={t("common.loading")} />;
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-3 py-4 sm:px-6 sm:py-6">
      <ActionBar
        title="Agency Operations Dashboard"
        onGenerateLr={onGenerateLr}
        onAddRoute={onAddRouteAction}
        disabled={!agency}
      />

      {error ? <p className="rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-2 text-sm text-status-failed">{error}</p> : null}

      {message ? (
        <p className="rounded-lg border border-status-delivered/30 bg-status-delivered/10 px-4 py-2 text-sm text-status-delivered">{message}</p>
      ) : null}

      {!agency ? (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="font-['Poppins'] text-xl font-semibold tracking-tight text-slate-900">Create Agency Profile</h3>
          <p className="mt-1 text-sm text-slate-500">Complete your profile to unlock operational controls and route management.</p>

          <form className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2" onSubmit={createProfile}>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-600">Agency Name</span>
              <input
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                name="agencyName"
                value={profileForm.agencyName}
                onChange={onProfileChange}
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-600">City</span>
              <input
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                name="city"
                value={profileForm.city}
                onChange={onProfileChange}
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-600">GST Number</span>
              <input
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                name="gstNumber"
                value={profileForm.gstNumber}
                onChange={onProfileChange}
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-600">Contact Number</span>
              <input
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                name="contactNumber"
                value={profileForm.contactNumber}
                onChange={onProfileChange}
                required
              />
            </label>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-primary px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Create Agency
              </button>
            </div>
          </form>
        </article>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {kpiItems.map((item) => (
              <KpiCard key={item.key} icon={item.icon} value={item.value} label={item.label} toneClass={item.toneClass} />
            ))}
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(260px,0.34fr)_minmax(420px,0.66fr)]">
            <div className="flex h-full flex-col gap-4">
              <ProfileCard agency={agency} onEditProfile={onEditProfile} />
              <OperationsPanel operations={operationsSnapshot} />
            </div>

            <div className="h-full">
              <RouteManagementCard
                routes={agency.routes || []}
                routeForm={routeForm}
                editingRouteId={editingRouteId}
                routeSubmitting={routeSubmitting}
                onRouteChange={onRouteChange}
                onSubmitRoute={addRoute}
                onEditRoute={onEditRoute}
                onDeleteRoute={onDeleteRoute}
                onCancelEdit={resetRouteForm}
                routeSectionRef={routeSectionRef}
                routeFromInputRef={routeFromInputRef}
              />
            </div>
          </div>

          <ActivityFeed items={activityItems} />
        </>
      )}
    </section>
  );
}

export default AgencyDashboard;
