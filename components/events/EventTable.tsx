import {
  Eye,
  Pencil,
  QrCode,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";

const events = [
  {
    id: "EVT-240701",
    name: "Rahul & Priya Wedding",
    client: "Rahul Patil",
    date: "09 Jul 2026",
    photographer: "Akshay",
    payment: "Paid",
    gallery: "Published",
    ai: "Completed",
  },
  {
    id: "EVT-240702",
    name: "ABC Industries",
    client: "ABC Pvt Ltd",
    date: "10 Jul 2026",
    photographer: "Rahul",
    payment: "Pending",
    gallery: "Draft",
    ai: "Running",
  },
  {
    id: "EVT-240703",
    name: "Birthday Event",
    client: "Sneha Kulkarni",
    date: "11 Jul 2026",
    photographer: "Om",
    payment: "Advance",
    gallery: "Processing",
    ai: "Queued",
  },
];

function badge(status: string) {
  switch (status) {
    case "Paid":
    case "Published":
    case "Completed":
      return "bg-green-100 text-green-700";

    case "Pending":
    case "Queued":
      return "bg-orange-100 text-orange-700";

    case "Running":
    case "Processing":
      return "bg-blue-100 text-[#0A3F61]";

    case "Advance":
      return "bg-purple-100 text-purple-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function EventTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 px-6 py-5">

        <h2 className="text-xl font-bold text-slate-900">
          Events
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your photography workflow
        </p>

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Event
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Client
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Date
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Photographer
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Payment
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Gallery
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                AI
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {events.map((event) => (

              <tr
                key={event.id}
                className="border-t border-slate-100 transition hover:bg-slate-50"
              >

                <td className="px-6 py-5">

                  <p className="font-semibold text-slate-900">
                    {event.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {event.id}
                  </p>

                </td>

                <td className="px-6 py-5 text-sm">
                  {event.client}
                </td>

                <td className="px-6 py-5 text-sm">
                  {event.date}
                </td>

                <td className="px-6 py-5 text-sm">
                  {event.photographer}
                </td>

                <td className="px-6 py-5">

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(event.payment)}`}>
                    {event.payment}
                  </span>

                </td>

                <td className="px-6 py-5">

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(event.gallery)}`}>
                    {event.gallery}
                  </span>

                </td>

                <td className="px-6 py-5">

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(event.ai)}`}>
                    {event.ai}
                  </span>

                </td>

                <td className="px-6 py-5">

                  <div className="flex justify-center gap-2">

                    <button className="rounded-xl border p-2 hover:bg-slate-100">
                      <Eye size={16} />
                    </button>

                    <button className="rounded-xl border p-2 hover:bg-slate-100">
                      <Pencil size={16} />
                    </button>

                    <button className="rounded-xl border p-2 hover:bg-slate-100">
                      <QrCode size={16} />
                    </button>

                    <button className="rounded-xl border p-2 hover:bg-slate-100">
                      <Sparkles size={16} />
                    </button>

                    <button className="rounded-xl border p-2 hover:bg-slate-100">
                      <MoreHorizontal size={16} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}