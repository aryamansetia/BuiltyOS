import { useTranslation } from "react-i18next";

const steps = ["bookShipment", "generateLr", "dispatchAssign", "trackGps", "deliveryConfirmation"];

const iconProps = {
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "1.8",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	"aria-hidden": "true"
};

const StepIcons = [
	() => (
		<svg {...iconProps}>
			<path d="M3 7h18" />
			<path d="M6 4v6" />
			<path d="M18 4v6" />
			<rect x="4" y="7" width="16" height="13" rx="2" />
		</svg>
	),
	() => (
		<svg {...iconProps}>
			<rect x="4" y="3" width="16" height="18" rx="2" />
			<path d="M8 8h8" />
			<path d="M8 12h8" />
			<path d="M8 16h5" />
		</svg>
	),
	() => (
		<svg {...iconProps}>
			<path d="M3 16V8a2 2 0 0 1 2-2h10v10H3Z" />
			<path d="M15 10h3l3 3v3h-6" />
			<circle cx="7.5" cy="18" r="2" />
			<circle cx="17.5" cy="18" r="2" />
		</svg>
	),
	() => (
		<svg {...iconProps}>
			<path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
			<circle cx="12" cy="11" r="2.5" />
		</svg>
	),
	() => (
		<svg {...iconProps}>
			<path d="M5 12l5 5L20 7" />
			<circle cx="12" cy="12" r="10" />
		</svg>
	)
];

function HowItWorks() {
	const { t } = useTranslation();

	return (
		<section className="rounded-3xl border border-brand-border bg-white p-7 shadow-card sm:p-8">
			<header className="flex flex-col gap-2">
				<p className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary">
					{t("landing.flowSubtitle")}
				</p>
				<h3 className="font-heading text-section-title font-semibold tracking-tight text-brand-secondary">
					{t("landing.flowTitle")}
				</h3>
			</header>

			<ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
				{steps.map((step, index) => {
					const Icon = StepIcons[index];

					return (
						<li
							key={step}
							className="relative rounded-2xl border border-brand-border bg-brand-background p-4 shadow-sm"
						>
							<span className="inline-grid h-7 w-7 place-items-center rounded-full bg-brand-primary text-xs font-bold text-white">
								{index + 1}
							</span>
							<span className="mt-3 inline-grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-brand-primary">
								<Icon />
							</span>
							<p className="mt-3 text-sm font-semibold leading-relaxed text-brand-secondary">{t(`landing.flow.${step}`)}</p>
						</li>
					);
				})}
			</ol>
		</section>
	);
}

export default HowItWorks;
