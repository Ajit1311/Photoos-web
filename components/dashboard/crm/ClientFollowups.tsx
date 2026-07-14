import {
  ChevronRight,
  MessageCircle,
  Phone,
  CalendarClock,
} from "lucide-react";

const followups = [
  {
    client: "Rahul Patil",
    purpose: "Album Selection Pending",
    due: "Today",
    action: "WhatsApp",
    icon: MessageCircle,
  },
  {
    client: "ABC Industries",
    purpose: "Payment Reminder",
    due: "Tomorrow",
    action: "Call",
    icon: Phone,
  },
  {
    client: "Sneha Kulkarni",
    purpose: "Gallery Approval",
    due: "2 Days",
    action: "WhatsApp",
    icon: MessageCircle,
  },
  {
    client: "Patil Family",
    purpose: "Final Delivery",
    due: "Friday",
    action: "Meeting",
    icon: CalendarClock,
  },
];

export default function ClientFollowups() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Client Follow-ups
          </h2>

          <p className="mt-2 text-slate-500">
            Clients waiting for your response today.
          </p>

        </div>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm transition hover:bg-slate-50">

          View All

          <ChevronRight size={16} />

        </button>

      </div>

      <div className="space-y-4">

        {followups.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={`${item.client}-${item.purpose}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:border-[#0A3F61]/20 hover:shadow-md"
            >

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

                  <Icon size={20} />

                </div>

                <div>

                  <h3 className="font-semibold text-slate-900">
                    {item.client}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.purpose}
                  </p>

                </div>

              </div>

              <div className="text-right">

                <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">

                  {item.due}

                </span>

                <p className="mt-2 text-sm font-medium text-[#0A3F61]">
                  {item.action}
                </p>

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
}