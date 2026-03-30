import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatCard from "../../components/StatCard";

function AgencyDashboard() {
  const { t } = useTranslation();

  const [agency, setAgency] = useState(null);
  const [stats, setStats] = useState({ totalBookings: 0, delivered: 0, inTransit: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profileForm, setProfileForm] = useState({
    agencyName: "",
    city: "",
    gstNumber: "",
    contactNumber: ""
  });

  const [routeForm, setRouteForm] = useState({
    from: "",
    to: "",
    basePricePerKg: "",
    estimatedDays: ""
  });

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [{ data: agencyData }, { data: statsData }] = await Promise.all([
        axiosClient.get("/agency/me"),
        axiosClient.get("/booking/agency/stats")
      ]);

      setAgency(agencyData.agency);
      setStats(statsData);
    } catch (loadError) {
      if (loadError.message.toLowerCase().includes("not found")) {
        setAgency(null);
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
      await loadDashboard();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const addRoute = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await axiosClient.post("/agency/route", {
        ...routeForm,
        basePricePerKg: Number(routeForm.basePricePerKg),
        estimatedDays: Number(routeForm.estimatedDays || 1)
      });
      setRouteForm({ from: "", to: "", basePricePerKg: "", estimatedDays: "" });
      await loadDashboard();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  if (loading) {
    return <LoadingSpinner label={t("common.loading")} />;
  }

  return (
    <section className="space-y-5">
      <header className="section-head">
        <h2 className="typo-page-title">{t("agency.dashboardTitle")}</h2>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      {!agency ? (
        <article className="surface-card">
          <h3 className="typo-card-title">Create Agency Profile</h3>
          <form className="form-grid" onSubmit={createProfile}>
            <label>
              <span className="typo-label">Agency Name</span>
              <input name="agencyName" value={profileForm.agencyName} onChange={onProfileChange} required />
            </label>
            <label>
              <span className="typo-label">City</span>
              <input name="city" value={profileForm.city} onChange={onProfileChange} required />
            </label>
            <label>
              <span className="typo-label">GST Number</span>
              <input name="gstNumber" value={profileForm.gstNumber} onChange={onProfileChange} />
            </label>
            <label>
              <span className="typo-label">Contact Number</span>
              <input name="contactNumber" value={profileForm.contactNumber} onChange={onProfileChange} required />
            </label>
            <button className="solid-btn full-width" type="submit">
              Create Agency
            </button>
          </form>
        </article>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard title="Total Bookings" value={stats.totalBookings} />
            <StatCard title="In Transit" value={stats.inTransit} />
            <StatCard title="Delivered" value={stats.delivered} />
          </div>

          <article className="surface-card">
            <h3 className="typo-card-title">{agency.agencyName}</h3>
            <p className="typo-body">
              {agency.city} | Contact: {agency.contactNumber} | Rating: {agency.rating}
            </p>
            <div className="route-list">
              {(agency.routes || []).map((route) => (
                <div key={route._id} className="route-chip">
                  <span>
                    {route.from} to {route.to}
                  </span>
                  <strong>INR {route.basePricePerKg}/kg</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-card">
            <h3 className="typo-card-title">Add New Route</h3>
            <form className="form-grid" onSubmit={addRoute}>
              <label>
                <span className="typo-label">{t("common.from")}</span>
                <input name="from" value={routeForm.from} onChange={onRouteChange} required />
              </label>
              <label>
                <span className="typo-label">{t("common.to")}</span>
                <input name="to" value={routeForm.to} onChange={onRouteChange} required />
              </label>
              <label>
                <span className="typo-label">Base Price per Kg</span>
                <input
                  type="number"
                  min="1"
                  name="basePricePerKg"
                  value={routeForm.basePricePerKg}
                  onChange={onRouteChange}
                  required
                />
              </label>
              <label>
                <span className="typo-label">Estimated Days</span>
                <input
                  type="number"
                  min="1"
                  name="estimatedDays"
                  value={routeForm.estimatedDays}
                  onChange={onRouteChange}
                />
              </label>
              <button type="submit" className="solid-btn full-width">
                Add Route
              </button>
            </form>
          </article>
        </>
      )}
    </section>
  );
}

export default AgencyDashboard;
