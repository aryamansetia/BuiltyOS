import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "../context/AuthContext";

const getNavLinkClassName = ({ isActive }) =>
  [
    "rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-700 transition",
    "hover:-translate-y-0.5 hover:bg-blue-50 hover:text-brand-primary",
    isActive ? "bg-blue-50 text-brand-primary" : ""
  ].join(" ");

const logoutButtonClassName =
  "rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm font-semibold text-brand-secondary transition hover:-translate-y-0.5 hover:border-brand-primary hover:text-brand-primary";

function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="top-nav">
      <Link to="/" className="brand-link">
        <span className="brand-mark">BO</span>
        <div>
          <h1>{t("appName")}</h1>
          <p>{t("tagline")}</p>
        </div>
      </Link>

      <nav className="ml-auto flex flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3 md:gap-x-4" aria-label="Primary">
        <NavLink to="/tracking" className={getNavLinkClassName}>
          {t("nav.tracking")}
        </NavLink>

        {!isAuthenticated && (
          <NavLink to="/login" className={getNavLinkClassName}>
            {t("nav.login")}
          </NavLink>
        )}
        {!isAuthenticated && (
          <NavLink to="/register" className={getNavLinkClassName}>
            {t("nav.register")}
          </NavLink>
        )}

        {isAuthenticated && user?.role === "customer" && (
          <>
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
              {t("nav.agencyDashboard")}
            </NavLink>
            <NavLink to="/agency/bookings" className={getNavLinkClassName}>
              {t("nav.bookingManagement")}
            </NavLink>
            <NavLink to="/agency/documents" className={getNavLinkClassName}>
              {t("nav.documents")}
            </NavLink>
          </>
        )}

        <LanguageSwitcher compact className="ml-1" />

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
