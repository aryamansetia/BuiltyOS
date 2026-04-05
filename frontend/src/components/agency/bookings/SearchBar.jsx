function SearchBar({ searchQuery, onSearchChange, onCreateBooking }) {
  return (
    <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
      <button
        type="button"
        onClick={onCreateBooking}
        className="inline-flex w-full items-center justify-center rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-105 lg:w-auto"
      >
        + Create Booking
      </button>

      <input
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by LR, customer, route..."
        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 focus:ring-brand-primary/30 lg:w-72"
      />
    </div>
  );
}

export default SearchBar;
