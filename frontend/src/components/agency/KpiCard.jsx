function KpiCard({ icon, value, label, toneClass }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>{icon}</span>
      </div>

      <div className="mt-3">
        <p className="font-['Poppins'] text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      </div>
    </article>
  );
}

export default KpiCard;
