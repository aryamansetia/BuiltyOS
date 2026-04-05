import { Fragment } from "react";

import ActionDropdown from "./ActionDropdown";
import StatusBadge from "./StatusBadge";

const timelineStages = ["Booked", "Dispatched", "Arrived", "Delivered"];

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString();
};

function IncomingBookingsTable({
  bookings,
  expandedBookingId,
  onRowClick,
  onGenerateLr,
  onDispatch,
  onDelete
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 text-left text-sm uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Goods</th>
              <th className="px-6 py-4">Weight</th>
              <th className="px-6 py-4">LR</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => {
              const isExpanded = expandedBookingId === booking._id;
              const currentStatusIndex = timelineStages.indexOf(booking.status);
              const canGenerateLr = !booking.lr?.lrNumber;
              const canDispatch = Boolean(booking.lr?._id) && booking.status === "Booked";

              const actions = [
                {
                  label: isExpanded ? "Hide" : "View",
                  onClick: () => onRowClick(booking._id)
                },
                {
                  label: "Generate LR",
                  onClick: () => onGenerateLr(booking),
                  disabled: !canGenerateLr
                },
                {
                  label: "Dispatch",
                  onClick: () => onDispatch(booking),
                  disabled: !canDispatch
                },
                {
                  label: "Delete",
                  onClick: () => onDelete(booking),
                  danger: true
                }
              ];

              return (
                <Fragment key={booking._id}>
                  <tr
                    className="cursor-pointer border-t border-slate-100 transition hover:bg-gray-50"
                    onClick={() => onRowClick(booking._id)}
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {booking.sourceCity} &rarr; {booking.destinationCity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{booking.customer?.fullName || "-"}</td>
                    <td className="max-w-[240px] truncate px-6 py-4 text-sm text-slate-700">{booking.goodsDescription}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{booking.weightKg} kg</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{booking.lr?.lrNumber || "Pending"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex justify-end">
                        <ActionDropdown actions={actions} />
                      </div>
                    </td>
                  </tr>

                  {isExpanded ? (
                    <tr className="border-t border-slate-100 bg-slate-50/70">
                      <td colSpan={7} className="px-6 py-5">
                        <div className="grid gap-5 lg:grid-cols-3">
                          <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                            <h4 className="font-semibold text-slate-900">Vehicle Info</h4>
                            <p className="text-sm text-slate-600">LR Number: {booking.lr?.lrNumber || "Pending"}</p>
                            <p className="text-sm text-slate-600">
                              Vehicle: {booking.lr?.vehicle ? `Assigned (${String(booking.lr.vehicle).slice(-6)})` : "Not assigned"}
                            </p>
                            <p className="text-sm text-slate-600">Pickup Date: {formatDate(booking.pickupDate)}</p>
                          </section>

                          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                            <h4 className="font-semibold text-slate-900">Shipment Timeline</h4>
                            {timelineStages.map((stage, index) => {
                              const completed = currentStatusIndex >= index;

                              return (
                                <div key={stage} className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                                      completed ? "bg-brand-primary" : "bg-slate-300"
                                    }`}
                                  />
                                  <p className={`text-sm ${completed ? "font-medium text-slate-800" : "text-slate-500"}`}>{stage}</p>
                                </div>
                              );
                            })}
                          </section>

                          <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                            <h4 className="font-semibold text-slate-900">Contact Details</h4>
                            <p className="text-sm text-slate-600">Name: {booking.customer?.fullName || "-"}</p>
                            <p className="text-sm text-slate-600">Email: {booking.customer?.email || "-"}</p>
                            <p className="text-sm text-slate-600">Phone: {booking.customer?.phone || "-"}</p>
                            <p className="text-sm text-slate-600">Notes: {booking.notes || "-"}</p>
                          </section>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IncomingBookingsTable;
