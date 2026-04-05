import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const initialFilters = {
  search: "",
  category: "",
  location: ""
};

const initialJobForm = {
  title: "",
  category: "driver",
  location: "",
  salary: "",
  description: ""
};

const initialOpenApplicationForm = {
  applicantName: "",
  phone: "",
  experience: ""
};

const applicationStatusClassMap = {
  pending: "border border-amber-200 bg-amber-50 text-amber-700",
  accepted: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border border-rose-200 bg-rose-50 text-rose-700"
};

const fieldClassName =
  "w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-brand-secondary outline-none ring-brand-primary/30 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200";

function JobsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const isAgency = user?.role === "agency";
  const isWorker = user?.role === "worker";
  const pageTitle = isWorker ? t("jobs.titleApply") : t("jobs.title");
  const pageSubtitle = isWorker ? t("jobs.subtitleApply") : t("jobs.subtitle");

  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [jobForm, setJobForm] = useState(initialJobForm);
  const [openApplicationForm, setOpenApplicationForm] = useState(initialOpenApplicationForm);
  const [applicationDrafts, setApplicationDrafts] = useState({});
  const [applicationsByJob, setApplicationsByJob] = useState({});
  const [expandedApplications, setExpandedApplications] = useState({});
  const [openApplications, setOpenApplications] = useState([]);
  const [openApplicationsLoading, setOpenApplicationsLoading] = useState(false);
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

  const fetchJobs = async (activeFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (activeFilters.search.trim()) {
        params.search = activeFilters.search.trim();
      }

      if (activeFilters.category) {
        params.category = activeFilters.category;
      }

      if (activeFilters.location.trim()) {
        params.location = activeFilters.location.trim();
      }

      const { data } = await axiosClient.get("/jobs", { params });
      setJobs(data.jobs || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpenApplications = async (silent = false) => {
    if (!isAgency) {
      return;
    }

    if (!silent) {
      setOpenApplicationsLoading(true);
    }

    try {
      const { data } = await axiosClient.get("/applications/open");
      setOpenApplications(data.applications || []);
    } catch (loadError) {
      if (!silent) {
        setError(loadError.message);
      }
    } finally {
      if (!silent) {
        setOpenApplicationsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchJobs(initialFilters);
    fetchMyAgency();

    if (isAgency) {
      fetchOpenApplications();
    }
  }, []);

  useEffect(() => {
    if (!isAgency) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      fetchOpenApplications(true);
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isAgency]);

  const isMyJob = (job) => {
    const postedById = job.postedBy?._id || job.postedBy?.id;
    return Boolean(myAgencyId && postedById && String(postedById) === String(myAgencyId));
  };

  const getApplicationStatusLabel = (status) => {
    if (status === "pending") {
      return t("jobs.statusPending");
    }

    if (status === "accepted") {
      return t("jobs.statusAccepted");
    }

    if (status === "rejected") {
      return t("jobs.statusRejected");
    }

    return status;
  };

  const submitFilters = async (event) => {
    event.preventDefault();
    await fetchJobs(filters);
  };

  const resetFilters = async () => {
    setFilters(initialFilters);
    await fetchJobs(initialFilters);
  };

  const createJob = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: jobForm.title.trim(),
        category: jobForm.category,
        location: jobForm.location.trim(),
        salary: Number(jobForm.salary),
        description: jobForm.description.trim()
      };

      const { data } = await axiosClient.post("/jobs", payload);
      setMessage(data.message);
      setJobForm(initialJobForm);
      await fetchJobs(filters);
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitOpenApplication = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        applicantName: openApplicationForm.applicantName.trim() || undefined,
        phone: openApplicationForm.phone.trim() || undefined,
        experience: openApplicationForm.experience.trim() || undefined
      };

      const { data } = await axiosClient.post("/applications/open", payload);
      setMessage(data.message);
      setOpenApplicationForm(initialOpenApplicationForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const applyToJob = async (jobId) => {
    const draft = applicationDrafts[jobId] || {};

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        applicantName: draft.applicantName?.trim() || undefined,
        phone: draft.phone?.trim() || undefined,
        experience: draft.experience?.trim() || undefined
      };

      const { data } = await axiosClient.post(`/jobs/${jobId}/apply`, payload);
      setMessage(data.message);
      setApplicationDrafts((prev) => ({
        ...prev,
        [jobId]: { applicantName: "", phone: "", experience: "" }
      }));
      await fetchJobs(filters);
    } catch (applyError) {
      setError(applyError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchApplications = async (jobId) => {
    const { data } = await axiosClient.get(`/jobs/${jobId}/applications`);
    setApplicationsByJob((prev) => ({
      ...prev,
      [jobId]: data.applications || []
    }));
  };

  const toggleApplications = async (jobId) => {
    const nextState = !expandedApplications[jobId];
    setExpandedApplications((prev) => ({ ...prev, [jobId]: nextState }));

    if (nextState) {
      try {
        await fetchApplications(jobId);
      } catch (loadError) {
        setError(loadError.message);
      }
    }
  };

  const updateApplicationStatus = async (jobId, applicationId, status) => {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axiosClient.patch(`/applications/${applicationId}`, { status });
      setMessage(data.message);
      await fetchApplications(jobId);
      await fetchJobs(filters);
      await fetchOpenApplications(true);
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleString();
  };

  return (
    <section className="space-y-6 pt-1">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="typo-page-title">{pageTitle}</h2>
          <p className="typo-body">{pageSubtitle}</p>
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {message ? <p className="success-text">{message}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <form className="surface-card grid gap-3" onSubmit={submitFilters}>
            <h3 className="typo-card-title">{t("jobs.filtersTitle")}</h3>

            <label>
              <span className="typo-label">{t("jobs.search")}</span>
              <input
                className={fieldClassName}
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              />
            </label>

            <label>
              <span className="typo-label">{t("jobs.category")}</span>
              <select
                className={fieldClassName}
                value={filters.category}
                onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
              >
                <option value="">{t("jobs.allCategories")}</option>
                <option value="labour">{t("jobs.categoryLabour")}</option>
                <option value="accountant">{t("jobs.categoryAccountant")}</option>
                <option value="driver">{t("jobs.categoryDriver")}</option>
              </select>
            </label>

            <label>
              <span className="typo-label">{t("jobs.location")}</span>
              <input
                className={fieldClassName}
                value={filters.location}
                onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
              />
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
            <form className="surface-card grid gap-3" onSubmit={createJob}>
              <h3 className="typo-card-title">{t("jobs.postJobTitle")}</h3>

              <label>
                <span className="typo-label">{t("jobs.titleField")}</span>
                <input
                  className={fieldClassName}
                  value={jobForm.title}
                  onChange={(event) => setJobForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </label>

              <label>
                <span className="typo-label">{t("jobs.category")}</span>
                <select
                  className={fieldClassName}
                  value={jobForm.category}
                  onChange={(event) => setJobForm((prev) => ({ ...prev, category: event.target.value }))}
                >
                  <option value="labour">{t("jobs.categoryLabour")}</option>
                  <option value="accountant">{t("jobs.categoryAccountant")}</option>
                  <option value="driver">{t("jobs.categoryDriver")}</option>
                </select>
              </label>

              <label>
                <span className="typo-label">{t("jobs.location")}</span>
                <input
                  className={fieldClassName}
                  value={jobForm.location}
                  onChange={(event) => setJobForm((prev) => ({ ...prev, location: event.target.value }))}
                  required
                />
              </label>

              <label>
                <span className="typo-label">{t("jobs.salary")}</span>
                <input
                  className={fieldClassName}
                  type="number"
                  min="0"
                  value={jobForm.salary}
                  onChange={(event) => setJobForm((prev) => ({ ...prev, salary: event.target.value }))}
                  required
                />
              </label>

              <label>
                <span className="typo-label">{t("jobs.description")}</span>
                <textarea
                  className={fieldClassName}
                  rows={4}
                  value={jobForm.description}
                  onChange={(event) => setJobForm((prev) => ({ ...prev, description: event.target.value }))}
                  required
                />
              </label>

              <button type="submit" className="solid-btn" disabled={submitting}>
                {submitting ? t("common.loading") : t("jobs.postJob")}
              </button>
            </form>
          ) : null}

          {isWorker ? (
            <form className="surface-card grid gap-3" onSubmit={submitOpenApplication}>
              <h3 className="typo-card-title">{t("jobs.openApplicationTitle")}</h3>
              <p className="typo-helper">{t("jobs.openApplicationSubtitle")}</p>

              <label>
                <span className="typo-label">{t("jobs.applicantName")}</span>
                <input
                  className={fieldClassName}
                  value={openApplicationForm.applicantName}
                  onChange={(event) =>
                    setOpenApplicationForm((prev) => ({
                      ...prev,
                      applicantName: event.target.value
                    }))
                  }
                />
              </label>

              <label>
                <span className="typo-label">{t("auth.phone")}</span>
                <input
                  className={fieldClassName}
                  value={openApplicationForm.phone}
                  onChange={(event) =>
                    setOpenApplicationForm((prev) => ({
                      ...prev,
                      phone: event.target.value
                    }))
                  }
                />
              </label>

              <label>
                <span className="typo-label">{t("jobs.experience")}</span>
                <textarea
                  className={fieldClassName}
                  rows={3}
                  value={openApplicationForm.experience}
                  onChange={(event) =>
                    setOpenApplicationForm((prev) => ({
                      ...prev,
                      experience: event.target.value
                    }))
                  }
                />
              </label>

              <button type="submit" className="solid-btn" disabled={submitting}>
                {submitting ? t("common.loading") : t("jobs.submitOpenApplication")}
              </button>
            </form>
          ) : null}
        </aside>

        <div className="space-y-4">
          {loading ? <LoadingSpinner label={t("common.loading")} /> : null}

          {isAgency ? (
            <section className="surface-card space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="typo-card-title">{t("jobs.liveApplicationsTitle")}</h3>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {t("jobs.liveLabel")}
                </span>
              </div>
              <p className="typo-helper">{t("jobs.liveApplicationsSubtitle")}</p>

              {openApplicationsLoading ? <LoadingSpinner label={t("common.loading")} /> : null}

              {!openApplicationsLoading && openApplications.length === 0 ? (
                <p className="typo-body">{t("jobs.noOpenApplications")}</p>
              ) : null}

              {openApplications.length > 0 ? (
                <div className="grid gap-2">
                  {openApplications.map((application) => (
                    <article key={application._id} className="rounded-xl border border-brand-border bg-brand-background p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-brand-secondary">{application.applicantName}</p>
                          <p className="typo-helper">{application.phone}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${applicationStatusClassMap[application.status] || applicationStatusClassMap.pending}`}
                        >
                          {getApplicationStatusLabel(application.status)}
                        </span>
                      </div>

                      <p className="typo-helper mt-2">{application.experience || "-"}</p>
                      <p className="typo-helper mt-2">
                        {t("jobs.receivedAt")}: {formatDateTime(application.createdAt)}
                      </p>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => {
              const isOwner = isMyJob(job);
              const applications = applicationsByJob[job._id] || [];
              const isExpanded = Boolean(expandedApplications[job._id]);
              const draft = applicationDrafts[job._id] || {
                applicantName: "",
                phone: "",
                experience: ""
              };

              return (
                <article key={job._id} className="surface-card space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="typo-card-title">{job.title}</h3>
                      <p className="typo-helper">
                        {t("jobs.category")}: {t(`jobs.category${job.category.charAt(0).toUpperCase()}${job.category.slice(1)}`)}
                      </p>
                    </div>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      {job.applicationsCount || 0} {t("jobs.applications")}
                    </span>
                  </div>

                  <p className="typo-body">
                    {t("jobs.location")}: {job.location}
                  </p>
                  <p className="typo-body">
                    {t("jobs.salary")}: INR {job.salary}
                  </p>
                  <p className="typo-body">{job.description}</p>
                  <p className="typo-helper">
                    {t("marketplace.postedBy")}: {job.postedBy?.agencyName || "-"}
                  </p>

                  {isWorker ? (
                    <div className="grid gap-2 border-t border-brand-border pt-3">
                      <label>
                        <span className="typo-label">{t("jobs.applicantName")}</span>
                        <input
                          className={fieldClassName}
                          value={draft.applicantName}
                          onChange={(event) =>
                            setApplicationDrafts((prev) => ({
                              ...prev,
                              [job._id]: {
                                ...draft,
                                applicantName: event.target.value
                              }
                            }))
                          }
                        />
                      </label>

                      <label>
                        <span className="typo-label">{t("auth.phone")}</span>
                        <input
                          className={fieldClassName}
                          value={draft.phone}
                          onChange={(event) =>
                            setApplicationDrafts((prev) => ({
                              ...prev,
                              [job._id]: {
                                ...draft,
                                phone: event.target.value
                              }
                            }))
                          }
                        />
                      </label>

                      <label>
                        <span className="typo-label">{t("jobs.experience")}</span>
                        <textarea
                          className={fieldClassName}
                          rows={2}
                          value={draft.experience}
                          onChange={(event) =>
                            setApplicationDrafts((prev) => ({
                              ...prev,
                              [job._id]: {
                                ...draft,
                                experience: event.target.value
                              }
                            }))
                          }
                        />
                      </label>

                      <button
                        type="button"
                        className="solid-btn"
                        disabled={submitting}
                        onClick={() => applyToJob(job._id)}
                      >
                        {t("jobs.applyNow")}
                      </button>
                    </div>
                  ) : null}

                  {isAgency && isOwner ? (
                    <div className="grid gap-2 border-t border-brand-border pt-3">
                      <button type="button" className="outline-btn" onClick={() => toggleApplications(job._id)}>
                        {isExpanded ? t("jobs.hideApplicants") : t("jobs.viewApplicants")}
                      </button>

                      {isExpanded ? (
                        <div className="grid gap-2">
                          {applications.length === 0 ? (
                            <p className="typo-body">{t("jobs.noApplications")}</p>
                          ) : (
                            applications.map((application) => (
                              <article key={application._id} className="rounded-xl border border-brand-border bg-brand-background p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-brand-secondary">{application.applicantName}</p>
                                    <p className="typo-helper">{application.phone}</p>
                                  </div>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${applicationStatusClassMap[application.status] || applicationStatusClassMap.pending}`}
                                  >
                                    {getApplicationStatusLabel(application.status)}
                                  </span>
                                </div>
                                <p className="typo-helper mt-2">{application.experience || "-"}</p>
                                <div className="row-actions mt-3">
                                  <button
                                    type="button"
                                    className="solid-btn"
                                    disabled={submitting || application.status === "accepted"}
                                    onClick={() => updateApplicationStatus(job._id, application._id, "accepted")}
                                  >
                                    {t("jobs.accept")}
                                  </button>
                                  <button
                                    type="button"
                                    className="outline-btn"
                                    disabled={submitting || application.status === "rejected"}
                                    onClick={() => updateApplicationStatus(job._id, application._id, "rejected")}
                                  >
                                    {t("jobs.reject")}
                                  </button>
                                </div>
                              </article>
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {!loading && jobs.length === 0 ? (
            <article className="surface-card border-dashed border-blue-200/70 bg-blue-50/40">
              <h3 className="typo-card-title">{t("jobs.filtersTitle")}</h3>
              <p className="typo-body mt-1">{isWorker ? t("jobs.noJobsToApply") : t("jobs.noJobs")}</p>
            </article>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default JobsPage;
