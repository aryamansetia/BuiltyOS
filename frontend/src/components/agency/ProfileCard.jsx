const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 10h2" />
    <path d="M9 14h2" />
    <path d="M13 10h2" />
    <path d="M13 14h2" />
  </svg>
);

function ProfileCard({ agency, onEditProfile }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <BuildingIcon />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          <span aria-hidden="true">★</span>
          {agency.rating || 4.2}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="font-['Poppins'] text-xl font-semibold tracking-tight text-slate-900">{agency.agencyName}</h3>
        <p className="mt-1 text-sm text-slate-500">Agency profile snapshot</p>
      </div>

      <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Location</dt>
          <dd className="font-semibold text-slate-800">{agency.city || "-"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Contact</dt>
          <dd className="font-semibold text-slate-800">{agency.contactNumber || "-"}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onEditProfile}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
      >
        Edit Profile
      </button>
    </article>
  );
}

export default ProfileCard;
