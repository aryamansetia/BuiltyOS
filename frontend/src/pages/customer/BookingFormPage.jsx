import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import axiosClient from "../../api/axiosClient";
import LoadingSpinner from "../../components/LoadingSpinner";

function BookingFormPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedAgency = location.state?.agency;
  const selectedRoute = location.state?.route;

  const [agencies, setAgencies] = useState([]);
  const [form, setForm] = useState({
    agencyId: selectedAgency?._id || selectedAgency?.id || "",
    sourceCity: selectedRoute?.from || "",
    destinationCity: selectedRoute?.to || "",
    goodsDescription: "",
    weightKg: "",
    pickupDate: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [fetchingAgencies, setFetchingAgencies] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadAgencies = async () => {
      setFetchingAgencies(true);
      try {
        const { data } = await axiosClient.get("/agency");
        setAgencies(data.agencies || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setFetchingAgencies(false);
      }
    };

    loadAgencies();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        weightKg: Number(form.weightKg)
      };
      const { data } = await axiosClient.post("/booking/create", payload);
      setSuccess(`Booking created with ID: ${data.booking._id}`);
      setForm((prev) => ({
        ...prev,
        goodsDescription: "",
        weightKg: "",
        notes: ""
      }));
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <header className="section-head">
        <h2>{t("customer.bookingTitle")}</h2>
      </header>

      {fetchingAgencies ? <LoadingSpinner label={t("common.loading")} /> : null}

      <form className="surface-card form-grid" onSubmit={onSubmit}>
        <label>
          Agency
          <select name="agencyId" value={form.agencyId} onChange={onChange} required>
            <option value="">{t("common.select")}</option>
            {agencies.map((agency) => (
              <option key={agency._id} value={agency._id}>
                {agency.agencyName} ({agency.city})
              </option>
            ))}
          </select>
        </label>

        <label>
          {t("common.from")}
          <input name="sourceCity" value={form.sourceCity} onChange={onChange} required />
        </label>

        <label>
          {t("common.to")}
          <input name="destinationCity" value={form.destinationCity} onChange={onChange} required />
        </label>

        <label>
          Goods Description
          <input name="goodsDescription" value={form.goodsDescription} onChange={onChange} required />
        </label>

        <label>
          Weight (kg)
          <input type="number" min="1" name="weightKg" value={form.weightKg} onChange={onChange} required />
        </label>

        <label>
          Pickup Date
          <input type="date" name="pickupDate" value={form.pickupDate} onChange={onChange} required />
        </label>

        <label className="full-width">
          Notes
          <textarea name="notes" value={form.notes} onChange={onChange} rows={3} />
        </label>

        {error ? <p className="error-text full-width">{error}</p> : null}
        {success ? <p className="success-text full-width">{success}</p> : null}

        <div className="row-actions full-width">
          <button type="submit" className="solid-btn" disabled={loading}>
            {loading ? t("common.loading") : t("nav.bookShipment")}
          </button>
          <button type="button" className="outline-btn" onClick={() => navigate("/customer/dashboard")}>
            {t("nav.customerDashboard")}
          </button>
        </div>
      </form>
    </section>
  );
}

export default BookingFormPage;
