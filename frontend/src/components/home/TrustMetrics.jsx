import { useTranslation } from "react-i18next";

const metricValues = {
	shipments: {
		value: "100+",
		progress: 92
	},
	agencies: {
		value: "20+",
		progress: 76
	},
	lr: {
		value: "300+",
		progress: 88
	}
};

function TrustMetrics() {
	const { t } = useTranslation();

	return (
		<section className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50 p-6 shadow-card sm:p-8">
			<header className="mx-auto max-w-2xl text-center">
				<h3 className="font-heading text-section-title font-semibold tracking-tight text-brand-secondary">
					{t("landing.trustTitle")}
				</h3>
			</header>

			<div className="mx-auto mt-6 grid w-full max-w-4xl gap-3 sm:grid-cols-3">
				{Object.entries(metricValues).map(([metricKey, metric], index) => (
					<article key={metricKey} className="rounded-xl border border-slate-200 bg-white px-4 py-5 text-center shadow-sm">
						<p className="font-heading text-3xl font-bold tracking-tight text-brand-primary">{metric.value}</p>
						<p className="typo-body mt-2 text-brand-secondary">{t(`landing.metrics.${metricKey}`)}</p>
						<div className="metric-progress-track" aria-hidden="true">
							<span
								className="metric-progress-fill"
								style={{
									"--progress-target": `${metric.progress}%`,
									"--progress-delay": `${120 + index * 90}ms`
								}}
							/>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}

export default TrustMetrics;
