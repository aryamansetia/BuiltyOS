function ActivityFeed({ items }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="font-['Poppins'] text-xl font-semibold tracking-tight text-slate-900">Recent Activity</h3>

      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2.5 transition hover:border-slate-200 hover:bg-slate-50">
            <span className="mt-1.5 inline-flex h-2 w-2 rounded-full bg-brand-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.text}</p>
              {item.meta ? <p className="mt-0.5 text-xs text-slate-500">{item.meta}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ActivityFeed;
