import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const { t } = useTranslation();
  const { login, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const [loginMethod, setLoginMethod] = useState("password"); // "password" | "otp"
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await sendOTP(form.email);
      setOtpSent(true);
      if (res?.demoOtp) {
        setForm((prev) => ({ ...prev, otp: res.demoOtp }));
        setInfoMessage(`✅ Verification code generated: ${res.demoOtp} (Auto-filled for testing!)`);
      } else {
        setInfoMessage("Verification code sent to your email! Check your inbox or console.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (user) => {
    if (user.role === "agency") {
      navigate("/agency/dashboard");
    } else if (user.role === "worker") {
      navigate("/marketplace");
    } else {
      navigate("/customer/dashboard");
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      if (loginMethod === "otp") {
        const user = await verifyOTP({ email: form.email, otp: form.otp });
        redirectUser(user);
      } else {
        const user = await login({ email: form.email, password: form.password });
        redirectUser(user);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card space-y-4">
      <h2 className="typo-page-title text-center sm:text-left">{t("auth.loginTitle")}</h2>

      <div className="flex gap-2 border-b pb-2">
        <button
          type="button"
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            loginMethod === "password" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
          }`}
          onClick={() => {
            setLoginMethod("password");
            setError("");
            setInfoMessage("");
          }}
        >
          Password Login
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded text-sm font-medium transition ${
            loginMethod === "otp" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
          }`}
          onClick={() => {
            setLoginMethod("otp");
            setError("");
            setInfoMessage("");
          }}
        >
          🔑 Email OTP Login
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label>
          <span className="typo-label">{t("auth.email")}</span>
          <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="you@example.com" />
        </label>

        {loginMethod === "password" ? (
          <label>
            <span className="typo-label">{t("auth.password")}</span>
            <input type="password" name="password" value={form.password} onChange={onChange} required />
          </label>
        ) : (
          <div className="space-y-2">
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOTP}
                className="w-full py-2 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 transition disabled:opacity-50"
                disabled={loading || !form.email}
              >
                {loading ? <LoadingSpinner label="Sending OTP..." /> : "Send Email OTP Code"}
              </button>
            ) : (
              <label>
                <span className="typo-label">6-Digit Verification Code (OTP)</span>
                <input
                  type="text"
                  name="otp"
                  value={form.otp}
                  onChange={onChange}
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="tracking-widest font-mono text-center text-lg"
                />
              </label>
            )}
          </div>
        )}

        {error ? <p className="error-text">{error}</p> : null}
        {infoMessage ? <p className="text-sm text-emerald-600 font-medium">{infoMessage}</p> : null}

        {loginMethod === "password" || otpSent ? (
          <button type="submit" className="solid-btn w-full" disabled={loading}>
            {loading ? <LoadingSpinner label={t("common.loading")} /> : loginMethod === "otp" ? "Verify & Login" : t("auth.submitLogin")}
          </button>
        ) : null}
      </form>

      <p className="typo-body">
        New here? <Link to="/register">{t("nav.register")}</Link>
      </p>
    </section>
  );
}

export default LoginPage;
