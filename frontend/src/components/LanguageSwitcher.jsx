import { useTranslation } from "react-i18next";

const LANG_OPTIONS = [
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
  { code: "ta", label: "TA" }
];

function LanguageSwitcher({ compact = false, className = "" }) {
  const { i18n, t } = useTranslation();

  const current = i18n.language?.slice(0, 2) || "en";

  const handleChange = async (event) => {
    const nextLanguage = event.target.value;
    localStorage.setItem("builtyos_language", nextLanguage);
    await i18n.changeLanguage(nextLanguage);
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-2 shadow-sm ${className}`}
    >
      <label
        htmlFor="language-selector"
        className={compact ? "sr-only" : "text-xs font-semibold uppercase tracking-wide text-slate-500"}
      >
        {t("common.language")}
      </label>
      <select
        id="language-selector"
        value={current}
        onChange={handleChange}
        className="cursor-pointer rounded-md border-none bg-transparent text-sm font-semibold text-brand-secondary outline-none"
      >
        {LANG_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSwitcher;
