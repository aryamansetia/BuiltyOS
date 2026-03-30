import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusTimeline from "../../components/StatusTimeline";

function TrackingPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [lrNumber, setLrNumber] = useState(searchParams.get("lrNumber") || "");
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTracking = useCallback(async (targetLr) => {
    const normalizedLr = targetLr.trim();
    if (!normalizedLr) {
      setTracking(null);
      setError(t("customer.enterLr"));
      return;
    }

    setLoading(true);
    setError("");
    setTracking(null);

    try {
      const { data } = await axiosClient.get("/tracking", {
        params: { lrNumber: normalizedLr }
      });
      setTracking(data);
    } catch (trackError) {
      setError(trackError.message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const queryLrNumber = (searchParams.get("lrNumber") || "").trim();
    if (queryLrNumber) {
      setLrNumber(queryLrNumber);
      fetchTracking(queryLrNumber);
    } else {
      setTracking(null);
      setError("");
    }
  }, [searchParams, fetchTracking]);

  const onTrack = (event) => {
    event.preventDefault();
    const normalizedLr = lrNumber.trim();
    if (!normalizedLr) {
      setError(t("customer.enterLr"));
      setTracking(null);
      return;
    }

    setSearchParams({ lrNumber: normalizedLr });
  };

  return (
    <section className="space-y-5">
      <header className="section-head">
        <h2 className="typo-page-title">{t("customer.trackingTitle")}</h2>
      </header>

      <form className="inline-form" onSubmit={onTrack}>
        <label>
          <span className="typo-label">{t("customer.enterLr")}</span>
          <input
            value={lrNumber}
            onChange={(event) => setLrNumber(event.target.value)}
            placeholder={t("customer.enterLr")}
            required
          />
        </label>
        <button className="solid-btn" type="submit" disabled={loading}>
          {t("customer.trackNow")}
        </button>
      </form>

      {loading ? <LoadingSpinner label={t("common.loading")} /> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {tracking ? (
        <div className="tracking-layout">
          <article className="surface-card">
            <h3 className="typo-card-title">LR: {tracking.lrNumber}</h3>
            <p className="typo-body">
              {tracking.booking?.sourceCity} to {tracking.booking?.destinationCity}
            </p>
            <p className="typo-body">
              Vehicle: {tracking.vehicle?.vehicleNumber || "Not assigned"} | Driver: {tracking.vehicle?.driverName || "-"}
            </p>
            <span className={`status-pill ${tracking.status.toLowerCase()}`}>{t(`status.${tracking.status}`)}</span>

            <div className="map-mock">
              <h4 className="typo-card-title">Live Location</h4>
              <p className="typo-body">Latitude: {tracking.currentLocation?.latitude || "-"}</p>
              <p className="typo-body">Longitude: {tracking.currentLocation?.longitude || "-"}</p>
              <p className="typo-helper">
                Last Update: {tracking.currentLocation?.updatedAt ? new Date(tracking.currentLocation.updatedAt).toLocaleString() : "-"}
              </p>
            </div>
          </article>

          <article className="surface-card">
            <h3 className="typo-card-title">Status Timeline</h3>
            <StatusTimeline timeline={tracking.timeline || []} />
          </article>

          <article className="surface-card">
            <h3 className="typo-card-title">Recent GPS Logs</h3>
            <div className="stack-list">
              {(tracking.gpsLogs || []).map((log) => (
                <div key={`${log.recordedAt}-${log.latitude}`} className="gps-row">
                  <span>{new Date(log.recordedAt).toLocaleString()}</span>
                  <span>
                    {log.latitude}, {log.longitude}
                  </span>
                  <span>{log.speed || 0} km/h</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}

export default TrackingPage;
