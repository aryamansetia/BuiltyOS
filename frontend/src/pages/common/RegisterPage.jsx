import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "customer"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await register({
        ...form,
        preferredLanguage: i18n.language?.slice(0, 2) || "en"
      });
      navigate(user.role === "agency" ? "/agency/dashboard" : "/customer/search");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card space-y-3">
      <h2 className="typo-page-title text-center sm:text-left">{t("auth.registerTitle")}</h2>
      <form onSubmit={onSubmit}>
        <label>
          <span className="typo-label">{t("auth.fullName")}</span>
          <input name="fullName" value={form.fullName} onChange={onChange} required />
        </label>
        <label>
          <span className="typo-label">{t("auth.email")}</span>
          <input type="email" name="email" value={form.email} onChange={onChange} required />
        </label>
        <label>
          <span className="typo-label">{t("auth.password")}</span>
          <input type="password" name="password" value={form.password} onChange={onChange} required />
        </label>
        <label>
          <span className="typo-label">{t("auth.phone")}</span>
          <input name="phone" value={form.phone} onChange={onChange} />
        </label>
        <label>
          <span className="typo-label">{t("auth.role")}</span>
          <select name="role" value={form.role} onChange={onChange}>
            <option value="customer">{t("auth.customer")}</option>
            <option value="agency">{t("auth.agency")}</option>
          </select>
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="solid-btn" disabled={loading}>
          {loading ? <LoadingSpinner label={t("common.loading")} /> : t("auth.submitRegister")}
        </button>
      </form>
      <p className="typo-body">
        Already registered? <Link to="/login">{t("nav.login")}</Link>
      </p>
    </section>
  );
}

export default RegisterPage;
