import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "../context/AuthContext";

const getNavLinkClassName = ({ isActive }) =>
  [
    "inline-flex items-center justify-center rounded-xl border border-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200",
    "hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700",
    isActive ? "border-blue-200 bg-blue-100/80 text-blue-700 shadow-sm" : ""
  ].join(" ");

const getRegisterLinkClassName = ({ isActive }) =>
  [
    "inline-flex items-center justify-center rounded-xl border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200",
    "hover:-translate-y-0.5 hover:border-blue-800 hover:bg-blue-800",
    isActive ? "shadow-sm ring-2 ring-blue-200" : ""
  ].join(" ");

const logoutButtonClassName =
  "inline-flex items-center justify-center rounded-xl border border-blue-200/80 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700";

const iconClassName = "h-4 w-4";

const MarketplaceIcon = () => (
  <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 16V8a2 2 0 0 1 2-2h10v10H3Z" />
    <path d="M15 10h3l3 3v3h-6" />
    <circle cx="7.5" cy="18" r="2" />
    <circle cx="17.5" cy="18" r="2" />
  </svg>
);

const JobsIcon = () => (
  <svg className={iconClassName} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [trackingQuery, setTrackingQuery] = useState("");

  const showTrackingUtility = location.pathname === "/tracking";

  useEffect(() => {
    if (!showTrackingUtility) {
      return;
    }

    const queryValue = new URLSearchParams(location.search).get("lrNumber") || "";
    setTrackingQuery(queryValue);
  }, [location.search, showTrackingUtility]);

  const onLogout = () => {
    logout();
    navigate("/");
  };

  const onTrackingSearchSubmit = (event) => {
    event.preventDefault();
    const normalizedLr = trackingQuery.trim();

    if (!normalizedLr) {
      navigate("/tracking");
      return;
    }

    navigate(`/tracking?lrNumber=${encodeURIComponent(normalizedLr)}`);
  };

  const renderTrackingUtility = () => {
    if (!showTrackingUtility) {
      return null;
    }

    return (
      <form
        className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm md:inline-flex"
        onSubmit={onTrackingSearchSubmit}
      >
        <input
          type="text"
          value={trackingQuery}
          onChange={(event) => setTrackingQuery(event.target.value)}
          placeholder={t("customer.enterLr")}
          className="h-8 w-44 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-700 outline-none ring-blue-200 focus:ring-2"
          aria-label={t("customer.enterLr")}
        />
        <button
          type="submit"
          className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          {t("customer.trackNow")}
        </button>
      </form>
    );
  };

  return (
    <header className="top-nav">
      <Link to="/" className="brand-link">
        <span className="brand-mark" aria-hidden="true">
          <img src="/logo-truck.jpg" alt="" className="brand-logo" />
        </span>
        <div>
          <h1>{t("appName")}</h1>
          <p>{t("tagline")}</p>
        </div>
      </Link>

      <nav className="ml-auto flex flex-wrap items-center justify-end gap-2 md:gap-3" aria-label="Primary">
        {!isAuthenticated && (
          <NavLink to="/tracking" className={getNavLinkClassName}>
            {t("nav.tracking")}
          </NavLink>
        )}
        {!isAuthenticated ? renderTrackingUtility() : null}

        {!isAuthenticated && (
          <NavLink to="/jobs" className={getNavLinkClassName}>
            {t("nav.jobs")}
          </NavLink>
        )}

        {!isAuthenticated && (
          <NavLink to="/login" className={getNavLinkClassName}>
            {t("nav.login")}
          </NavLink>
        )}
        {!isAuthenticated && (
          <NavLink to="/register" className={getRegisterLinkClassName}>
            {t("nav.register")}
          </NavLink>
        )}

        {isAuthenticated && user?.role === "customer" && (
          <>
            <NavLink to="/tracking" className={getNavLinkClassName}>
              {t("nav.tracking")}
            </NavLink>
            {renderTrackingUtility()}
            <NavLink to="/customer/search" className={getNavLinkClassName}>
              {t("nav.searchAgencies")}
            </NavLink>
            <NavLink to="/customer/book" className={getNavLinkClassName}>
              {t("nav.bookShipment")}
            </NavLink>
            <NavLink to="/customer/dashboard" className={getNavLinkClassName}>
              {t("nav.customerDashboard")}
            </NavLink>
          </>
        )}

        {isAuthenticated && user?.role === "agency" && (
          <>
            <NavLink to="/agency/dashboard" className={getNavLinkClassName}>
              {t("nav.dashboard")}
            </NavLink>
            <NavLink to="/agency/bookings" className={getNavLinkClassName}>
              {t("nav.shipments")}
            </NavLink>
            <NavLink to="/agency/documents" className={getNavLinkClassName}>
              {t("nav.documents")}
            </NavLink>
            <NavLink to="/marketplace" className={getNavLinkClassName}>
              <span className="inline-flex items-center gap-1.5">
                <MarketplaceIcon />
                {t("nav.marketplace")}
              </span>
            </NavLink>
            <NavLink to="/jobs" className={getNavLinkClassName}>
              <span className="inline-flex items-center gap-1.5">
                <JobsIcon />
                {t("nav.jobs")}
              </span>
            </NavLink>
            <NavLink to="/tracking" className={getNavLinkClassName}>
              {t("nav.tracking")}
            </NavLink>
            {renderTrackingUtility()}
          </>
        )}

        {isAuthenticated && user?.role === "worker" && (
          <>
            <NavLink to="/marketplace" className={getNavLinkClassName}>
              <span className="inline-flex items-center gap-1.5">
                <MarketplaceIcon />
                {t("nav.marketplace")}
              </span>
            </NavLink>
            <NavLink to="/jobs" className={getNavLinkClassName}>
              <span className="inline-flex items-center gap-1.5">
                <JobsIcon />
                {t("nav.jobs")}
              </span>
            </NavLink>
            <NavLink to="/tracking" className={getNavLinkClassName}>
              {t("nav.tracking")}
            </NavLink>
            {renderTrackingUtility()}
          </>
        )}

        <LanguageSwitcher compact className="border-blue-100/80 bg-white/90" />

        {isAuthenticated && (
          <button type="button" className={logoutButtonClassName} onClick={onLogout}>
            {t("nav.logout")}
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
