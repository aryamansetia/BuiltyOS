import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

function RegisterPage() {
  const { t, i18n } = useTranslation();
  const { register, sendOTP } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "customer",
    otp: ""
  });
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    if (!form.email) {
      setError("Please enter a valid email address first.");
      return;
    }
    setSendingOtp(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await sendOTP(form.email);
      setOtpSent(true);
      if (res?.demoOtp) {
        setForm((prev) => ({ ...prev, otp: res.demoOtp }));
        setInfoMessage(`✅ Verification code generated: ${res.demoOtp} (Auto-filled for testing!)`);
      } else {
        setInfoMessage("Verification code sent! Please check your email inbox.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.otp) {
      setError("Please send and enter your 6-digit email verification code first.");
      return;
    }
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const user = await register({
        ...form,
        preferredLanguage: i18n.language?.slice(0, 2) || "en"
      });
      if (user.role === "agency") {
        navigate("/agency/dashboard");
      } else if (user.role === "worker") {
        navigate("/marketplace");
      } else {
        navigate("/customer/search");
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card space-y-3">
      <h2 className="typo-page-title text-center sm:text-left">{t("auth.registerTitle")}</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <label>
          <span className="typo-label">{t("auth.fullName")}</span>
          <input name="fullName" value={form.fullName} onChange={onChange} required />
        </label>
        
        <div>
          <label>
            <span className="typo-label">{t("auth.email")}</span>
            <div className="flex gap-2">
              <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="you@example.com" />
              <button
                type="button"
                onClick={handleSendOTP}
                className="px-3 py-2 bg-slate-800 text-white rounded text-xs font-semibold whitespace-nowrap hover:bg-slate-900 transition disabled:opacity-50"
                disabled={sendingOtp || !form.email}
              >
                {sendingOtp ? <LoadingSpinner label="Sending..." /> : otpSent ? "Resend Code" : "Send Code"}
              </button>
            </div>
          </label>
        </div>

        {otpSent ? (
          <label>
            <span className="typo-label">6-Digit Email Verification Code (OTP)</span>
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
        ) : null}

        <label>
          <span className="typo-label">{t("auth.password")}</span>
          <input type="password" name="password" value={form.password} onChange={onChange} required minLength={6} />
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
            <option value="worker">{t("auth.worker")}</option>
          </select>
        </label>

        {error ? <p className="error-text">{error}</p> : null}
        {infoMessage ? <p className="text-sm text-emerald-600 font-medium">{infoMessage}</p> : null}

        <button type="submit" className="solid-btn w-full" disabled={loading || !form.otp}>
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
