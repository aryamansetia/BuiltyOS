import { useEffect, useRef, useState } from "react";

function ActionDropdown({ actions }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-brand-primary"
        aria-label="Row actions"
      >
        <span className="text-base leading-none">...</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                if (action.disabled) {
                  return;
                }

                action.onClick();
                setOpen(false);
              }}
              disabled={action.disabled}
              className={`block w-full px-3 py-2 text-left text-sm transition ${
                action.disabled
                  ? "cursor-not-allowed text-slate-300"
                  : action.danger
                    ? "text-rose-600 hover:bg-rose-50"
                    : "text-brand-primary hover:bg-blue-50 hover:underline"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default ActionDropdown;
