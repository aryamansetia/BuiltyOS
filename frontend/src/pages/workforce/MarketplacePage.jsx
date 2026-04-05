import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const initialFilters = {
  origin: "",
  destination: "",
  vehicleType: "",
  minPrice: "",
  maxPrice: "",
  status: ""
};

const initialLoadForm = {
  origin: "",
  destination: "",
  price: "",
  weight: "",
  vehicleType: "",
  linkedBooking: "",
  notes: ""
};

const statusClassMap = {
  open: "border border-blue-200 bg-blue-50 text-blue-700",
  assigned: "border border-amber-200 bg-amber-50 text-amber-700",
  completed: "border border-emerald-200 bg-emerald-50 text-emerald-700"
};

const fieldClassName =
  "w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-brand-secondary outline-none ring-brand-primary/30 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200";

function MarketplacePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const isAgency = user?.role === "agency";
  const isWorker = user?.role === "worker";

  const [loads, setLoads] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loadForm, setLoadForm] = useState(initialLoadForm);
  const [assignSelections, setAssignSelections] = useState({});
  const [myAgencyId, setMyAgencyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchMyAgency = async () => {
    if (!isAgency) {
      return;
    }

    try {
      const { data } = await axiosClient.get("/agency/me");
      setMyAgencyId(data.agency?._id || "");
    } catch {
      setMyAgencyId("");
    }
  };

  const fetchLoads = async (activeFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (activeFilters.origin.trim()) {
        params.origin = activeFilters.origin.trim();
      }

      if (activeFilters.destination.trim()) {
        params.destination = activeFilters.destination.trim();
      }

      if (activeFilters.vehicleType.trim()) {
        params.vehicleType = activeFilters.vehicleType.trim();
      }

      if (activeFilters.status) {
        params.status = activeFilters.status;
      }

      if (activeFilters.minPrice.trim()) {
        params.minPrice = Number(activeFilters.minPrice);
      }

      if (activeFilters.maxPrice.trim()) {
        params.maxPrice = Number(activeFilters.maxPrice);
      }

      const { data } = await axiosClient.get("/loads", { params });
      setLoads(data.loads || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads(initialFilters);
    fetchMyAgency();
  }, []);

  const isMyLoad = (load) => {
    const postedById = load.postedBy?._id || load.postedBy?.id;
    return Boolean(myAgencyId && postedById && String(postedById) === String(myAgencyId));
  };

  const getStatusLabel = (status) => {
    if (status === "open") {
      return t("marketplace.statusOpen");
    }

    if (status === "assigned") {
      return t("marketplace.statusAssigned");
    }

    if (status === "completed") {
      return t("marketplace.statusCompleted");
    }

    return status;
  };

  const submitFilters = async (event) => {
    event.preventDefault();
    await fetchLoads(filters);
  };

  const resetFilters = async () => {
    setFilters(initialFilters);
    await fetchLoads(initialFilters);
  };

  const createLoad = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        origin: loadForm.origin.trim(),
        destination: loadForm.destination.trim(),
        price: Number(loadForm.price),
        weight: Number(loadForm.weight),
        vehicleType: loadForm.vehicleType.trim(),
        notes: loadForm.notes.trim() || undefined,
        linkedBooking: loadForm.linkedBooking.trim() || undefined
      };

      const { data } = await axiosClient.post("/loads", payload);
      setMessage(data.message);
      setLoadForm(initialLoadForm);
      await fetchLoads(filters);
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const applyToLoad = async (loadId) => {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axiosClient.post(`/loads/${loadId}/apply`);
      setMessage(data.message);
      await fetchLoads(filters);
    } catch (applyError) {
      setError(applyError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const assignWorker = async (loadId) => {
    const driverId = assignSelections[loadId];
    if (!driverId) {
      setError(t("marketplace.selectWorker"));
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axiosClient.post(`/loads/${loadId}/assign`, { driverId });
      setMessage(data.message);
      setAssignSelections((prev) => ({ ...prev, [loadId]: "" }));
      await fetchLoads(filters);
    } catch (assignError) {
      setError(assignError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="typo-page-title">{t("marketplace.title")}</h2>
          <p className="typo-body">{t("marketplace.subtitle")}</p>
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {message ? <p className="success-text">{message}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <form className="surface-card grid gap-3" onSubmit={submitFilters}>
            <h3 className="typo-card-title">{t("marketplace.filtersTitle")}</h3>

            <label>
              <span className="typo-label">{t("marketplace.origin")}</span>
              <input
                className={fieldClassName}
                value={filters.origin}
                onChange={(event) => setFilters((prev) => ({ ...prev, origin: event.target.value }))}
              />
            </label>

            <label>
              <span className="typo-label">{t("marketplace.destination")}</span>
              <input
                className={fieldClassName}
                value={filters.destination}
                onChange={(event) => setFilters((prev) => ({ ...prev, destination: event.target.value }))}
              />
            </label>

            <label>
              <span className="typo-label">{t("marketplace.vehicleType")}</span>
              <input
                className={fieldClassName}
                value={filters.vehicleType}
                onChange={(event) => setFilters((prev) => ({ ...prev, vehicleType: event.target.value }))}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="min-w-0">
                <span className="typo-label">{t("marketplace.minPrice")}</span>
                <input
                  className={fieldClassName}
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(event) => setFilters((prev) => ({ ...prev, minPrice: event.target.value }))}
                />
              </label>

              <label className="min-w-0">
                <span className="typo-label">{t("marketplace.maxPrice")}</span>
                <input
                  className={fieldClassName}
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) => setFilters((prev) => ({ ...prev, maxPrice: event.target.value }))}
                />
              </label>
            </div>

            <label>
              <span className="typo-label">{t("marketplace.status")}</span>
              <select
                className={fieldClassName}
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="">{t("marketplace.allStatuses")}</option>
                <option value="open">{t("marketplace.statusOpen")}</option>
                <option value="assigned">{t("marketplace.statusAssigned")}</option>
                <option value="completed">{t("marketplace.statusCompleted")}</option>
              </select>
            </label>

            <div className="row-actions">
              <button type="submit" className="solid-btn" disabled={loading}>
                {t("common.search")}
              </button>
              <button type="button" className="outline-btn" onClick={resetFilters}>
                {t("marketplace.resetFilters")}
              </button>
            </div>
          </form>

          {isAgency ? (
            <form className="surface-card grid gap-3" onSubmit={createLoad}>
              <h3 className="typo-card-title">{t("marketplace.postLoadTitle")}</h3>

              <label>
                <span className="typo-label">{t("marketplace.origin")}</span>
                <input
                  className={fieldClassName}
                  value={loadForm.origin}
                  onChange={(event) => setLoadForm((prev) => ({ ...prev, origin: event.target.value }))}
                  required
                />
              </label>

              <label>
                <span className="typo-label">{t("marketplace.destination")}</span>
                <input
                  className={fieldClassName}
                  value={loadForm.destination}
                  onChange={(event) => setLoadForm((prev) => ({ ...prev, destination: event.target.value }))}
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="min-w-0">
                  <span className="typo-label">{t("marketplace.price")}</span>
                  <input
                    className={fieldClassName}
                    type="number"
                    min="0"
                    value={loadForm.price}
                    onChange={(event) => setLoadForm((prev) => ({ ...prev, price: event.target.value }))}
                    required
                  />
                </label>

                <label className="min-w-0">
                  <span className="typo-label">{t("marketplace.weight")}</span>
                  <input
                    className={fieldClassName}
                    type="number"
                    min="0"
                    value={loadForm.weight}
                    onChange={(event) => setLoadForm((prev) => ({ ...prev, weight: event.target.value }))}
                    required
                  />
                </label>
              </div>

              <label>
                <span className="typo-label">{t("marketplace.vehicleType")}</span>
                <input
                  className={fieldClassName}
                  value={loadForm.vehicleType}
                  onChange={(event) => setLoadForm((prev) => ({ ...prev, vehicleType: event.target.value }))}
                  required
                />
              </label>

              <label>
                <span className="typo-label">{t("marketplace.linkedBooking")}</span>
                <input
                  className={fieldClassName}
                  value={loadForm.linkedBooking}
                  onChange={(event) => setLoadForm((prev) => ({ ...prev, linkedBooking: event.target.value }))}
                />
              </label>

              <label>
                <span className="typo-label">{t("marketplace.notes")}</span>
                <textarea
                  className={fieldClassName}
                  rows={3}
                  value={loadForm.notes}
                  onChange={(event) => setLoadForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </label>

              <button type="submit" className="solid-btn" disabled={submitting}>
                {submitting ? t("common.loading") : t("marketplace.createLoad")}
              </button>
            </form>
          ) : null}
        </aside>

        <div className="space-y-4">
          {loading ? <LoadingSpinner label={t("common.loading")} /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            {loads.map((load) => {
              const isOwner = isMyLoad(load);
              const applicants = load.applicants || [];
              const selectedWorker = assignSelections[load._id] || "";
              const alreadyApplied = applicants.some(
                (applicant) => String(applicant._id || applicant.id) === String(user?.id)
              );
              const assignedToUser =
                user?.id &&
                load.assignedTo &&
                String(load.assignedTo._id || load.assignedTo.id) === String(user.id);

              return (
                <article key={load._id} className="surface-card space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="typo-card-title">
                      {load.origin} to {load.destination}
                    </h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassMap[load.status] || statusClassMap.open}`}>
                      {getStatusLabel(load.status)}
                    </span>
                  </div>

                  <p className="typo-body">
                    {t("marketplace.price")}: INR {load.price} | {t("marketplace.weight")}: {load.weight} kg
                  </p>
                  <p className="typo-body">
                    {t("marketplace.vehicleType")}: {load.vehicleType}
                  </p>
                  <p className="typo-helper">
                    {t("marketplace.postedBy")}: {load.postedBy?.agencyName || "-"}
                  </p>
                  <p className="typo-helper">
                    {t("marketplace.assignedTo")}: {load.assignedTo?.fullName || t("common.notAvailable")}
                  </p>

                  {applicants.length > 0 ? (
                    <div>
                      <p className="typo-label">{t("marketplace.applicants")}</p>
                      <ul className="mt-1 grid gap-1">
                        {applicants.map((applicant) => (
                          <li key={applicant._id || applicant.id} className="text-sm text-slate-600">
                            {applicant.fullName} ({applicant.phone || "-"})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {isWorker && load.status === "open" ? (
                    <button
                      type="button"
                      className="solid-btn"
                      disabled={submitting || alreadyApplied}
                      onClick={() => applyToLoad(load._id)}
                    >
                      {alreadyApplied ? t("marketplace.alreadyApplied") : t("marketplace.acceptLoad")}
                    </button>
                  ) : null}

                  {isWorker && assignedToUser ? (
                    <p className="success-text">{t("marketplace.assignedToYou")}</p>
                  ) : null}

                  {isAgency && isOwner && applicants.length > 0 && load.status !== "completed" ? (
                    <div className="grid gap-2 border-t border-brand-border pt-3">
                      <label>
                        <span className="typo-label">{t("marketplace.selectWorker")}</span>
                        <select
                          className={fieldClassName}
                          value={selectedWorker}
                          onChange={(event) =>
                            setAssignSelections((prev) => ({
                              ...prev,
                              [load._id]: event.target.value
                            }))
                          }
                        >
                          <option value="">{t("common.select")}</option>
                          {applicants.map((applicant) => (
                            <option key={applicant._id || applicant.id} value={applicant._id || applicant.id}>
                              {applicant.fullName}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="outline-btn"
                        disabled={submitting}
                        onClick={() => assignWorker(load._id)}
                      >
                        {t("marketplace.assignWorker")}
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {!loading && loads.length === 0 ? <p className="typo-body">{t("marketplace.noLoads")}</p> : null}
        </div>
      </div>
    </section>
  );
}

export default MarketplacePage;
