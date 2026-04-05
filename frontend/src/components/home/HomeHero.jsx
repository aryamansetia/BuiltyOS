import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const primaryCtaClass =
  "inline-flex items-center justify-center rounded-xl bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-float transition hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300";

const secondaryCtaClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-brand-secondary transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700";

const tertiaryCtaClass =
  "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-brand-primary underline-offset-2 transition hover:text-blue-700 hover:underline";

function HomeHero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lrNumber, setLrNumber] = useState("");

  const handleTrackSubmit = (event) => {
    event.preventDefault();
    const value = lrNumber.trim();
    navigate(value ? `/tracking?lrNumber=${encodeURIComponent(value)}` : "/tracking");
  };

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary">
          {t("landing.badge")}
        </p>
        <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight leading-[1.08] text-brand-secondary sm:text-4xl">
          {t("landing.heroTitle")}
        </h2>
        <p className="typo-body mt-4 max-w-2xl">{t("landing.heroSubtitle")}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to="/customer/book" className={primaryCtaClass}>
            {t("landing.ctaCreateShipment")}
          </Link>
          <Link to="/agency/dashboard" className={secondaryCtaClass}>
            {t("landing.ctaManageAgency")}
          </Link>
          <Link to="/jobs" className={tertiaryCtaClass}>
            {t("jobs.applyNow")}
          </Link>
        </div>
      </div>

      <article
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-4 shadow-card sm:p-6"
        aria-label={t("customer.trackingTitle")}
      >
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-blue-200/30 blur-2xl" aria-hidden="true" />

        <div className="relative grid gap-2">
          <h3 className="font-heading text-section-title font-semibold tracking-tight text-brand-secondary">
            {t("customer.trackingTitle")}
          </h3>

          <form
            className="mt-2 grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
            onSubmit={handleTrackSubmit}
          >
            <input
              type="text"
              className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-brand-secondary outline-none ring-brand-primary/30 placeholder:text-slate-400 focus:ring-4"
              value={lrNumber}
              onChange={(event) => setLrNumber(event.target.value)}
              placeholder={t("landing.trackPlaceholder")}
              aria-label={t("landing.trackPlaceholder")}
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-primary px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {t("landing.trackCta")}
            </button>
          </form>
        </div>
      </article>
    </section>
  );
}

export default HomeHero;
