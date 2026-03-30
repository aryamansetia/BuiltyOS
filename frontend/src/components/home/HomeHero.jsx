import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const demoLrNumber = "LR-92421588-794";

const primaryCtaClass =
  "inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-float transition hover:-translate-y-0.5 hover:bg-blue-700";

const secondaryCtaClass =
  "inline-flex items-center justify-center rounded-xl border border-brand-border bg-white px-5 py-2.5 text-sm font-semibold text-brand-secondary transition hover:-translate-y-0.5 hover:border-brand-primary hover:text-brand-primary";

const textCtaClass =
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
    <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
      <div className="rounded-3xl border border-brand-border bg-white p-7 shadow-card sm:p-8">
        <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary">
          {t("landing.badge")}
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight leading-[1.08] text-brand-secondary sm:text-4xl">
          {t("landing.heroTitle")}
        </h2>
        <p className="typo-body mt-3 max-w-2xl">{t("landing.heroSubtitle")}</p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link to="/customer/book" className={primaryCtaClass}>
            {t("landing.ctaCreateShipment")}
          </Link>
          <Link to="/agency/dashboard" className={secondaryCtaClass}>
            {t("landing.ctaManageAgency")}
          </Link>
          <Link to="/tracking" className={textCtaClass}>
            {t("landing.ctaTrackShipment")}
          </Link>
        </div>

        <form
          className="mt-6 grid gap-2 rounded-2xl border border-brand-border bg-brand-background p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          onSubmit={handleTrackSubmit}
        >
          <input
            type="text"
            className="h-11 rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-secondary outline-none ring-brand-primary/30 placeholder:text-slate-400 focus:ring-4"
            value={lrNumber}
            onChange={(event) => setLrNumber(event.target.value)}
            placeholder={t("landing.trackPlaceholder")}
            aria-label={t("landing.trackPlaceholder")}
          />
          <button type="submit" className={primaryCtaClass}>
            {t("landing.trackCta")}
          </button>
        </form>

        <p className="typo-helper mt-2">{t("landing.trackHint", { lr: demoLrNumber })}</p>
      </div>

      <article
        className="relative overflow-hidden rounded-3xl border border-brand-border bg-gradient-to-br from-white via-white to-blue-50 p-7 shadow-card sm:p-8"
        aria-label={t("landing.previewTitle")}
      >
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-200/30 blur-2xl" aria-hidden="true" />

        <div className="relative flex items-center justify-between gap-3">
          <h3 className="font-heading text-card-title font-semibold tracking-tight text-brand-secondary">
            {t("landing.previewTitle")}
          </h3>
          <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-brand-primary">
            LIVE
          </span>
        </div>

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-helper uppercase tracking-wide text-slate-500">{t("landing.previewLrLabel")}</p>
            <strong className="text-sm text-brand-secondary">{demoLrNumber}</strong>
          </div>
          <div>
            <p className="text-helper uppercase tracking-wide text-slate-500">{t("landing.previewRouteLabel")}</p>
            <strong className="text-sm text-brand-secondary">Delhi to Chennai</strong>
          </div>
          <div>
            <p className="text-helper uppercase tracking-wide text-slate-500">{t("landing.previewVehicleLabel")}</p>
            <strong className="text-sm text-brand-secondary">TN 22 K 9184</strong>
          </div>
          <div>
            <p className="text-helper uppercase tracking-wide text-slate-500">ETA</p>
            <strong className="text-sm text-brand-secondary">Today, 7:30 PM</strong>
          </div>
        </div>

        <div className="relative mt-5 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-brand-border bg-white p-3">
            <strong className="text-xl text-brand-secondary">24/7</strong>
            <p className="typo-helper mt-1 text-slate-600">{t("landing.heroMetrics.ops")}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-white p-3">
            <strong className="text-xl text-brand-secondary">99.2%</strong>
            <p className="typo-helper mt-1 text-slate-600">{t("landing.heroMetrics.reliability")}</p>
          </div>
          <div className="rounded-xl border border-brand-border bg-white p-3">
            <strong className="text-xl text-brand-secondary">3 min</strong>
            <p className="typo-helper mt-1 text-slate-600">{t("landing.heroMetrics.lrTime")}</p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default HomeHero;
