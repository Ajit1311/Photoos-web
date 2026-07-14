import {
  CalendarDays,
  Clock3,
  CreditCard,
  Sparkles,
  Image,
  Camera,
  Users,
  Truck,
  HardDrive,
} from "lucide-react";

const tasks = [
  {
    title: "Rahul & Priya Wedding",
    subtitle: "Wedding Shoot",
    time: "09:00 AM",
    icon: CalendarDays,
  },
  {
    title: "Corporate Payment Pending",
    subtitle: "₹45,000 Remaining",
    time: "Today",
    icon: CreditCard,
  },
  {
    title: "AI Processing Queue",
    subtitle: "18 Jobs Running",
    time: "Live",
    icon: Sparkles,
  },
  {
    title: "Gallery Approval",
    subtitle: "5 Galleries Waiting",
    time: "Pending",
    icon: Image,
  },
  {
    title: "Album Selection",
    subtitle: "3 Clients Pending",
    time: "Today",
    icon: Camera,
  },
  {
    title: "Client Meeting",
    subtitle: "ABC Industries",
    time: "02:00 PM",
    icon: Users,
  },
  {
    title: "Final Delivery",
    subtitle: "Patil Family Album",
    time: "05:00 PM",
    icon: Truck,
  },
  {
    title: "Backup Verification",
    subtitle: "Cloud Storage Check",
    time: "06:00 PM",
    icon: HardDrive,
  },
];

export default function TodaysFocus() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Today&apos;s Focus
          </h2>

          <p className="mt-2 text-slate-500">
            Priority tasks for your studio today.
          </p>

        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-[#0A3F61]/10 px-4 py-2 text-[#0A3F61]">

          <Clock3 size={18} />

          <span className="font-semibold">
            Live
          </span>

        </div>

      </div>

      <div className="space-y-4">

        {tasks.map((task) => {

          const Icon = task.icon;

          return (

            <div
              key={task.title}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:border-[#0A3F61]/20 hover:bg-slate-50"
            >

              <div className="flex items-center gap-4">

                <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

                  <Icon size={20} />

                </div>

                <div>

                  <h3 className="font-semibold text-slate-900">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {task.subtitle}
                  </p>

                </div>

              </div>

              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                {task.time}
              </span>

            </div>

          );

        })}

      </div>

    </section>
  );
}