function OperationsPanel({ operations }) {
  const items = [
    {
      key: "booked",
      label: "Booked",
      value: operations.booked,
      toneClass: "text-slate-900"
    },
    {
      key: "lr-pending",
      label: "LR Pending",
      value: operations.lrPending,
      toneClass: operations.lrPending > 0 ? "text-amber-700" : "text-slate-900"
    },
    {
      key: "in-transit",
      label: "In Transit",
      value: operations.inTransit,
      toneClass: operations.inTransit > 0 ? "text-blue-700" : "text-slate-900"
    },
    {
      key: "delivered",
      label: "Delivered",
      value: operations.delivered,
      toneClass: operations.delivered > 0 ? "text-emerald-700" : "text-slate-900"
    }
  ];

  return (
    <article className="flex h-full min-h-[320px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-['Poppins'] text-lg font-semibold tracking-tight text-slate-900">Today's Operations</h3>
      <p className="mt-1 text-sm text-slate-500">Live operational snapshot across current shipments.</p>

      <div className="mt-4 grid flex-1 content-start grid-cols-2 gap-2.5">
        {items.map((item) => (
          <div key={item.key} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
            <p className={`mt-1 font-['Poppins'] text-2xl font-semibold leading-none ${item.toneClass}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default OperationsPanel;
