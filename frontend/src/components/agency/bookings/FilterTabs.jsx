function FilterTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {tabs.map((tab) => {
        const isActive = tab.label === activeTab;

        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onChange(tab.label)}
            className={
              isActive
                ? "rounded-full bg-brand-primary px-4 py-1 text-sm font-semibold text-white transition"
                : "px-1 py-1 text-sm font-semibold text-gray-500 transition hover:text-brand-primary"
            }
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${isActive ? "text-white/90" : "text-gray-400"}`}>{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;
