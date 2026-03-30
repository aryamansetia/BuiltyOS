import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";

function SearchAgenciesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
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
    fetchAgencies(from, to);
  };

  const onBookNow = (agency, route) => {
    navigate("/customer/book", {
      state: {
        agency,
        route
      }
    });
  };

  return (
    <section>
      <header className="section-head">
        <h2>{t("customer.searchTitle")}</h2>
      </header>

      <form className="inline-form" onSubmit={onSearch}>
        <label>
          {t("common.from")}
          <input value={from} onChange={(event) => setFrom(event.target.value)} placeholder="Delhi" />
        </label>
        <label>
          {t("common.to")}
          <input value={to} onChange={(event) => setTo(event.target.value)} placeholder="Mumbai" />
        </label>
        <button className="solid-btn" type="submit" disabled={loading}>
          {t("common.search")}
        </button>
      </form>

      {loading ? <LoadingSpinner label={t("common.loading")} /> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="card-grid">
        {agencies.map((agency) => (
          <article key={agency._id || agency.id} className="surface-card">
            <h3>{agency.agencyName}</h3>
            <p>{agency.city}</p>
            <p>Rating: {agency.rating || 4.2} / 5</p>
            <p>Contact: {agency.contactNumber || t("common.notAvailable")}</p>

            {(agency.matchingRoutes || agency.routes || []).map((route) => (
              <div key={route._id || `${route.from}-${route.to}`} className="route-chip">
                <span>
                  {route.from} to {route.to}
                </span>
                <strong>INR {route.basePricePerKg}/kg</strong>
                <button type="button" className="text-btn" onClick={() => onBookNow(agency, route)}>
                  {t("nav.bookShipment")}
                </button>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

export default SearchAgenciesPage;
