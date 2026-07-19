"use client";

const stats = [
  {
    label: "Budget",
    value: "₹0",
  },
  {
    label: "Received",
    value: "₹0",
  },
  {
    label: "Balance",
    value: "₹0",
  },
  {
    label: "Photos",
    value: "0",
  },
  {
    label: "Team",
    value: "0",
  },
  {
    label: "Pending",
    value: "0",
  },
];

export default function WorkspaceStats() {
  return (
    <div className="grid grid-cols-6 gap-3">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {item.label}
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {item.value}
          </h3>
        </div>
      ))}
    </div>
  );
}