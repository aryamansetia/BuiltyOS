import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";

const normalizeText = (value) => value.trim().toLowerCase();

const routeMatchesContext = (route, from, to) => {
  const normalizedFrom = normalizeText(from);
  const normalizedTo = normalizeText(to);

  const routeFrom = normalizeText(route.from || "");
  const routeTo = normalizeText(route.to || "");

  const fromMatches = normalizedFrom
    ? routeFrom.includes(normalizedFrom) || normalizedFrom.includes(routeFrom)
    : true;
  const toMatches = normalizedTo
    ? routeTo.includes(normalizedTo) || normalizedTo.includes(routeTo)
    : true;

  return fromMatches && toMatches;
};

const estimateTransitLabel = (estimatedDays) => {
  const parsedDays = Number(estimatedDays);
  if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
    return "3-4 Days";
  }

  const roundedDays = Math.round(parsedDays);
  return `${roundedDays}-${roundedDays + 1} Days`;
};

function SearchAgenciesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeTo, setActiveTo] = useState("");
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAgencies = async (queryFrom = "", queryTo = "") => {
    setLoading(true);
    setError("");

    try {
      const endpoint = queryFrom || queryTo ? "/agency/search" : "/agency";
      const { data } = await axiosClient.get(endpoint, {
        params: queryFrom || queryTo ? { from: queryFrom, to: queryTo } : {}
      });
      setAgencies(data.agencies || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const onSearch = (event) => {
    event.preventDefault();

    const queryFrom = from.trim();
    const queryTo = to.trim();

    setActiveFrom(queryFrom);
    setActiveTo(queryTo);
    fetchAgencies(queryFrom, queryTo);
  };

  const onSwapRoute = () => {
    setFrom(to);
    setTo(from);
  };

  const onBookNow = (agency, route) => {
    navigate("/customer/book", {
      state: {
        agency,
        route
      }
    });
  };

  const comparisonRows = useMemo(() => {
    return agencies
      .map((agency) => {
        const sourceRoutes = agency.matchingRoutes?.length ? agency.matchingRoutes : agency.routes || [];
        const laneRoutes = sourceRoutes.filter((route) => routeMatchesContext(route, activeFrom, activeTo));

        if (!laneRoutes.length) {
          return null;
        }

        return {
          agency,
          route: laneRoutes[0]
        };
      })
      .filter(Boolean);
  }, [activeFrom, activeTo, agencies]);

  const summaryFrom = activeFrom || "Any origin";
  const summaryTo = activeTo || "Any destination";

  return (
    <section className="mx-auto w-full max-w-[1200px] space-y-4 rounded-2xl bg-slate-50 p-3 sm:p-4">
      <header className="section-head">
        <h2 className="typo-page-title">{t("customer.searchTitle")}</h2>
      </header>

      <form className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm" onSubmit={onSearch}>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
          <label className="grid gap-1 lg:basis-[30%]">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Origin (e.g., Delhi)</span>
            <input
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              placeholder="Origin (e.g., Delhi)"
            />
          </label>

          <button
            type="button"
            onClick={onSwapRoute}
            className="inline-flex h-10 w-10 items-center justify-center self-start rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 lg:self-end"
            aria-label="Swap origin and destination"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M7 7h12" />
              <path d="M15 3l4 4-4 4" />
              <path d="M17 17H5" />
              <path d="M9 21l-4-4 4-4" />
            </svg>
          </button>

          <label className="grid gap-1 lg:basis-[30%]">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Destination (e.g., Mumbai)</span>
            <input
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="Destination (e.g., Mumbai)"
            />
          </label>

          <button
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 lg:basis-[20%]"
            type="submit"
            disabled={loading}
          >
            Search Agencies
          </button>
        </div>
      </form>

      {loading ? <LoadingSpinner label={t("common.loading")} /> : null}

      {error ? (
        <article className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
          Unable to fetch agencies right now. Please try again.
        </article>
      ) : null}

      {!loading ? (
        <p className="px-1 text-sm font-medium text-slate-600">
          Showing {comparisonRows.length} agencies for {summaryFrom} to {summaryTo}
        </p>
      ) : null}

      <div className="space-y-3">
        {comparisonRows.map(({ agency, route }) => {
          const ratingValue = Number(agency.rating) || 4.2;
          const reviewCount = agency.reviewCount || agency.reviewsCount || 120;
          const routeFrom = activeFrom || route.from || "-";
          const routeTo = activeTo || route.to || "-";

          return (
            <article
              key={agency._id || agency.id}
              className="flex min-h-[112px] flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm lg:h-[120px] lg:flex-row lg:items-center lg:overflow-hidden"
            >
              <div className="min-w-0 lg:basis-[30%]">
                <h3 className="truncate text-base font-bold text-slate-900">{agency.agencyName}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
                  <span className="inline-flex h-4 w-4 items-center justify-center text-amber-500" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </span>
                  {ratingValue.toFixed(1)}
                  <span className="font-medium text-slate-500">({reviewCount} Reviews)</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">{agency.city ? `HQ: ${agency.city}` : "Verified Partner"}</p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 lg:basis-[40%] lg:py-1.5">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <span>{routeFrom}</span>
                  <span className="inline-flex h-4 w-4 items-center justify-center text-slate-500" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span>{routeTo}</span>
                </p>
                <p className="mt-0.5 text-xl font-bold text-blue-700">
                  INR {route.basePricePerKg ?? t("common.notAvailable")} / kg
                </p>
                <p className="text-xs font-medium text-slate-500">Estimated Transit: {estimateTransitLabel(route.estimatedDays)}</p>
              </div>

              <div className="flex items-center justify-between gap-2 lg:basis-[30%] lg:flex-col lg:items-center lg:justify-center lg:gap-1.5">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 lg:w-44"
                  onClick={() => onBookNow(agency, route)}
                >
                  {t("nav.bookShipment")}
                </button>

                {agency.contactNumber ? (
                  <a
                    href={`tel:${agency.contactNumber}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
                    </svg>
                    Call: {agency.contactNumber}
                  </a>
                ) : (
                  <span className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400">{t("common.notAvailable")}</span>
                )}
              </div>
            </article>
          );
        })}

        {!loading && !error && comparisonRows.length === 0 ? (
          <article className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-700">No agencies found for this lane.</p>
            <p className="mt-1 text-sm text-slate-500">Try a different origin or destination.</p>
          </article>
        ) : null}
      </div>
    </section>
  );
}

export default SearchAgenciesPage;
