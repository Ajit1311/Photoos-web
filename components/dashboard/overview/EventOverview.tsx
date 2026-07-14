import {
  CalendarDays,
  Camera,
  CreditCard,
  FolderOpen,
  Image,
  MapPin,
  User,
} from "lucide-react";

const details = [
  { label: "Client", value: "Rahul Patil", icon: User },
  { label: "Photographer", value: "Akshay Naik", icon: Camera },
  { label: "Event Date", value: "09 July 2026", icon: CalendarDays },
  { label: "Venue", value: "Kolhapur", icon: MapPin },
  { label: "Payment", value: "Pending", icon: CreditCard },
  { label: "Gallery", value: "Published", icon: Image },
  { label: "Album", value: "In Progress", icon: FolderOpen },
];

export default function EventOverview() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Event Overview
        </h2>

        <p className="mt-2 text-slate-500">
          Basic information about this event.
        </p>
      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
        {details.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
                  <Icon size={20} />
                </div>

                <span className="text-sm text-slate-500">
                  {item.label}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                {item.value}
              </h3>
            </div>
          );
        })}
      </div>
    </section>
  );
}