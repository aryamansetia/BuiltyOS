import { useTranslation } from "react-i18next";

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
};

const FeatureIcons = {
  lr: () => (
    <svg {...iconProps}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  ),
  dispatch: () => (
    <svg {...iconProps}>
      <path d="M3 16V8a2 2 0 0 1 2-2h10v10H3Z" />
      <path d="M15 10h3l3 3v3h-6" />
      <circle cx="7.5" cy="18" r="2" />
      <circle cx="17.5" cy="18" r="2" />
    </svg>
  ),
  delivery: () => (
    <svg {...iconProps}>
      <path d="M5 12l5 5L20 7" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  gps: () => (
    <svg {...iconProps}>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  )
};

function FeatureCards() {
  const { t } = useTranslation();

  const features = [
    {
      key: "lr",
      title: t("landing.features.lr.title"),
      description: t("landing.features.lr.desc")
    },
    {
      key: "dispatch",
      title: t("landing.features.dispatch.title"),
      description: t("landing.features.dispatch.desc")
    },
    {
      key: "delivery",
      title: t("landing.features.delivery.title"),
      description: t("landing.features.delivery.desc")
    },
    {
      key: "gps",
      title: t("landing.features.gps.title"),
      description: t("landing.features.gps.desc")
    }
  ];

  return (
    <section className="rounded-3xl border border-brand-border bg-white p-7 shadow-card sm:p-8">
      <header className="flex flex-col gap-2">
        <p className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary">
          {t("landing.featuresSubtitle")}
        </p>
        <h3 className="font-heading text-section-title font-semibold tracking-tight text-brand-secondary">
          {t("landing.featuresTitle")}
        </h3>
      </header>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {features.map((feature) => {
          const Icon = FeatureIcons[feature.key];

          return (
            <article
              key={feature.key}
              className="group rounded-2xl border border-brand-border bg-brand-background p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-card"
            >
              <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-brand-primary">
                <Icon />
              </span>
              <h4 className="mt-3 font-heading text-card-title font-semibold tracking-tight text-brand-secondary">
                {feature.title}
              </h4>
              <p className="typo-body mt-2">{feature.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default FeatureCards;
