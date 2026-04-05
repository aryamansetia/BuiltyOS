import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
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
      const user = await login(form);
      if (user.role === "agency") {
        navigate("/agency/dashboard");
      } else if (user.role === "worker") {
        navigate("/marketplace");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card space-y-3">
      <h2 className="typo-page-title text-center sm:text-left">{t("auth.loginTitle")}</h2>
      <form onSubmit={onSubmit}>
        <label>
          <span className="typo-label">{t("auth.email")}</span>
          <input type="email" name="email" value={form.email} onChange={onChange} required />
        </label>
        <label>
          <span className="typo-label">{t("auth.password")}</span>
          <input type="password" name="password" value={form.password} onChange={onChange} required />
        </label>
        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="solid-btn" disabled={loading}>
          {loading ? <LoadingSpinner label={t("common.loading")} /> : t("auth.submitLogin")}
        </button>
      </form>
      <p className="typo-body">
        New here? <Link to="/register">{t("nav.register")}</Link>
      </p>
    </section>
  );
}

export default LoginPage;
