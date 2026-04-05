const statusClassMap = {
  Booked: "bg-orange-100 text-orange-600",
  Dispatched: "bg-blue-100 text-blue-600",
  Delivered: "bg-green-100 text-green-600",
  Arrived: "bg-indigo-100 text-indigo-600"
};

function StatusBadge({ status }) {
  const toneClass = statusClassMap[status] || "bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
