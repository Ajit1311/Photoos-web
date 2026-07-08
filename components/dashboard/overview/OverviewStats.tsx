import {
  TrendingUp,
  Wallet,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "Today's Revenue",
    value: "₹48,500",
    icon: Wallet,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Pending Deliveries",
    value: "08",
    icon: Clock3,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Completed Events",
    value: "14",
    icon: CheckCircle2,
    color: "bg-blue-100 text-[#0A3F61]",
  },
  {
    title: "Growth",
    value: "+18%",
    icon: TrendingUp,
    color: "bg-emerald-100 text-emerald-600",
  },
];

export default function OverviewStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {item.value}
                </h3>

              </div>

              <div className={`rounded-xl p-3 ${item.color}`}>
                <Icon size={22} />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}