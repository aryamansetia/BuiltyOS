function ActionBar({ title, onGenerateLr, onAddRoute, disabled = false }) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-primary">Agency Command Center</p>
          <h2 className="font-['Poppins'] text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">{title}</h2>
          <p className="text-sm text-slate-500">Manage shipments, documents, and route operations from one focused workspace.</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onGenerateLr}
            disabled={disabled}
            className="inline-flex h-10 min-w-[128px] items-center justify-center rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate LR
          </button>
          <button
            type="button"
            onClick={onAddRoute}
            disabled={disabled}
            className="inline-flex h-10 min-w-[128px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add Route
          </button>
        </div>
      </div>
    </header>
  );
}

export default ActionBar;
