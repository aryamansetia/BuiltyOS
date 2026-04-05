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
    <section className="mx-auto w-full max-w-[900px] space-y-5">
      <header className="section-head">
        <h2 className="typo-page-title">{t("customer.bookingTitle")}</h2>
      </header>

      {fetchingAgencies ? <LoadingSpinner label={t("common.loading")} /> : null}

      <form className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" onSubmit={onSubmit}>
        <div className="space-y-6 p-5 sm:p-6">
          <fieldset className="space-y-4 border-b border-slate-200 pb-6">
            <h3 className="text-lg font-semibold text-slate-800">1. Route Details</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="typo-label">Pickup Location (From)</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
                  name="sourceCity"
                  value={form.sourceCity}
                  onChange={onChange}
                  required
                />
              </label>

              <label className="grid gap-1.5">
                <span className="typo-label">Drop-off Location (To)</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
                  name="destinationCity"
                  value={form.destinationCity}
                  onChange={onChange}
                  required
                />
              </label>
            </div>

            <div className="flex">
              <label className="grid w-full gap-1.5 md:w-1/2 md:min-w-[220px]">
                <span className="typo-label">Pickup Date</span>
                <input
                  type="date"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                  name="pickupDate"
                  value={form.pickupDate}
                  onChange={onChange}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-b border-slate-200 pb-6">
            <h3 className="text-lg font-semibold text-slate-800">2. Shipment Details</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="typo-label">Goods Description</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
                  name="goodsDescription"
                  value={form.goodsDescription}
                  onChange={onChange}
                  required
                />
              </label>

              <label className="grid gap-1.5 md:max-w-[200px]">
                <span className="typo-label">Total Weight (kg)</span>
                <input
                  type="number"
                  min="1"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                  name="weightKg"
                  value={form.weightKg}
                  onChange={onChange}
                  required
                />
              </label>
            </div>

            <label className="grid gap-1.5">
              <span className="typo-label">Additional Notes</span>
              <textarea
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-blue-200 placeholder:text-slate-400 focus:ring-2"
                name="notes"
                value={form.notes}
                onChange={onChange}
                rows={4}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-4 pb-1">
            <h3 className="text-lg font-semibold text-slate-800">3. Carrier Assignment</h3>

            <label className="grid gap-1.5">
              <span className="typo-label">Select Transport Agency</span>
              <select
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                name="agencyId"
                value={form.agencyId}
                onChange={onChange}
                required
              >
                <option value="">{t("common.select")}</option>
                {agencies.map((agency) => (
                  <option key={agency._id} value={agency._id}>
                    {agency.agencyName} ({agency.city})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">Rates and availability will depend on the selected agency.</p>
            </label>
          </fieldset>

          {error ? <p className="error-text">{error}</p> : null}
          {success ? <p className="success-text">{success}</p> : null}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-transparent bg-transparent px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? t("common.loading") : "Confirm Booking"}
          </button>
        </footer>
      </form>
    </section>
  );
}

export default BookingFormPage;
