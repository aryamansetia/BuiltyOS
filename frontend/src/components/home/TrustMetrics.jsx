import { useTranslation } from "react-i18next";

const metricValues = {
	shipments: "100+",
	agencies: "20+",
	lr: "300+"
};

function TrustMetrics() {
	const { t } = useTranslation();

	return (
		<section className="rounded-3xl border border-brand-border bg-gradient-to-br from-white via-white to-blue-50 p-7 shadow-card sm:p-8">
			<header className="flex flex-col gap-2">
				<p className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary">
					{t("landing.trustSubtitle")}
				</p>
				<h3 className="font-heading text-section-title font-semibold tracking-tight text-brand-secondary">
					{t("landing.trustTitle")}
				</h3>
			</header>

			<div className="mt-5 grid gap-4 sm:grid-cols-3">
				{Object.entries(metricValues).map(([metricKey, value]) => (
					<article key={metricKey} className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
						<p className="font-heading text-3xl font-bold tracking-tight text-brand-primary">{value}</p>
						<p className="typo-body mt-2 text-brand-secondary">{t(`landing.metrics.${metricKey}`)}</p>
					</article>
				))}
			</div>
		</section>
	);
}

export default TrustMetrics;
