function RouteManagementCard({
  routes,
  routeForm,
  editingRouteId,
  routeSubmitting,
  onRouteChange,
  onSubmitRoute,
  onEditRoute,
  onDeleteRoute,
  onCancelEdit,
  routeSectionRef,
  routeFromInputRef
}) {
  const routeCount = routes.length;

  return (
    <article ref={routeSectionRef} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-['Poppins'] text-xl font-semibold tracking-tight text-slate-900">Route Management</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {routeCount} Active
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 sm:px-4">
        {routeCount ? (
          <ul className="divide-y divide-slate-200">
            {routes.map((route) => (
              <li key={route._id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-semibold text-slate-800 sm:text-[15px]">
                    {route.from} to {route.to}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">INR {route.basePricePerKg}/kg</span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-1">
                      {route.estimatedDays || 1} day transit
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditRoute(route)}
                    disabled={routeSubmitting}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRoute(route._id)}
                    disabled={routeSubmitting}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-6 text-center text-sm text-slate-500">
            No active routes yet. Add your first lane below.
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="text-sm font-semibold text-slate-700">{editingRouteId ? "Update Route" : "Add New Route"}</h4>

        <form className="mt-3 space-y-4" onSubmit={onSubmitRoute}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-600">From</span>
              <input
                ref={routeFromInputRef}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                name="from"
                value={routeForm.from}
                onChange={onRouteChange}
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-600">To</span>
              <input
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                name="to"
                value={routeForm.to}
                onChange={onRouteChange}
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-600">Base Price per Kg</span>
              <input
                type="number"
                min="1"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                name="basePricePerKg"
                value={routeForm.basePricePerKg}
                onChange={onRouteChange}
                required
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-600">Estimated Days</span>
              <input
                type="number"
                min="1"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-blue-200 focus:ring-2"
                name="estimatedDays"
                value={routeForm.estimatedDays}
                onChange={onRouteChange}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            {editingRouteId ? (
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={routeSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            ) : null}

            <button
              type="submit"
              disabled={routeSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {routeSubmitting ? "Saving..." : editingRouteId ? "Update Route" : "Add Route"}
            </button>
          </div>
        </form>
      </div>
    </article>
  );
}

export default RouteManagementCard;
