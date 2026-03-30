import { useTranslation } from "react-i18next";

const previewShipment = {
  lrNumber: "LR-24032911-042",
  agency: "Metro Goods Carriers",
  route: "Delhi to Bengaluru",
  vehicle: "KA 01 HG 4821",
  currentStage: 2
};

const timelineEvents = [
  { key: "booked", time: "09:10" },
  { key: "dispatched", time: "11:40" },
  { key: "inTransit", time: "14:15" },
  { key: "delivered", time: "Pending" }
];

const stageColor = {
  booked: "#F59E0B",
  dispatched: "#2563EB",
  inTransit: "#2563EB",
  delivered: "#22C55E"
};

function SystemPreview() {
  const { t } = useTranslation();

  return (
    <section className="rounded-3xl border border-brand-border bg-white p-7 shadow-card sm:p-8">
      <header className="flex flex-col gap-2">
        <p className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary">
          {t("landing.previewSubtitle")}
        </p>
        <h3 className="font-heading text-section-title font-semibold tracking-tight text-brand-secondary">
          {t("landing.previewTitle")}
        </h3>
      </header>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-2xl border border-brand-border bg-brand-background p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-heading text-card-title font-semibold tracking-tight text-brand-secondary">
              {t("landing.previewLrLabel")}
            </h4>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-brand-primary">
              {t("landing.previewStatusCurrent")}
            </span>
          </div>

          <p className="mt-2 text-2xl font-bold tracking-wide text-brand-secondary">{previewShipment.lrNumber}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-helper uppercase tracking-wide text-slate-500">{t("landing.previewAgencyLabel")}</p>
              <strong className="text-sm text-brand-secondary">{previewShipment.agency}</strong>
            </div>
            <div>
              <p className="text-helper uppercase tracking-wide text-slate-500">{t("landing.previewRouteLabel")}</p>
              <strong className="text-sm text-brand-secondary">{previewShipment.route}</strong>
            </div>
            <div>
              <p className="text-helper uppercase tracking-wide text-slate-500">{t("landing.previewVehicleLabel")}</p>
              <strong className="text-sm text-brand-secondary">{previewShipment.vehicle}</strong>
            </div>
            <div>
              <p className="text-helper uppercase tracking-wide text-slate-500">Status</p>
              <strong className="text-sm text-status-transit">{t("landing.timeline.inTransit")}</strong>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-brand-border bg-white p-5">
          <h4 className="font-heading text-card-title font-semibold tracking-tight text-brand-secondary">
            {t("landing.previewTimelineTitle")}
          </h4>
          <ol className="mt-4 grid gap-3">
            {timelineEvents.map((item, index) => {
              const isDone = index < previewShipment.currentStage;
              const isCurrent = index === previewShipment.currentStage;
              const color = stageColor[item.key];

              return (
                <li
                  key={item.key}
                  className="grid grid-cols-[18px_1fr] items-center gap-2"
                >
                  <span
                    className={`h-3 w-3 rounded-full border-2 ${isDone ? "opacity-100" : "opacity-55"} ${isCurrent ? "ring-4 ring-blue-100" : ""}`}
                    style={{ backgroundColor: isDone || isCurrent ? color : "#FFFFFF", borderColor: color }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium leading-relaxed text-brand-secondary">{t(`landing.timeline.${item.key}`)}</p>
                    <small className="text-helper leading-relaxed text-slate-500">{item.time}</small>
                  </div>
                </li>
              );
            })}
          </ol>
        </article>
      </div>
    </section>
  );
}

export default SystemPreview;
