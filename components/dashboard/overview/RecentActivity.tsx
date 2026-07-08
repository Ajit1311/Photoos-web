import {
  CheckCircle2,
  Upload,
  CreditCard,
  Sparkles,
  Clock,
} from "lucide-react";

const activities = [
  {
    title: "Wedding Gallery Published",
    description: "Rahul & Priya Wedding",
    time: "10 minutes ago",
    icon: <CheckCircle2 size={18} />,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "1,248 Photos Uploaded",
    description: "Corporate Event 2026",
    time: "32 minutes ago",
    icon: <Upload size={18} />,
    color: "bg-blue-100 text-[#0A3F61]",
  },
  {
    title: "Payment Received",
    description: "₹25,000 received from Akshay Patil",
    time: "1 hour ago",
    icon: <CreditCard size={18} />,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "AI Face Index Completed",
    description: "Wedding Album Processing",
    time: "2 hours ago",
    icon: <Sparkles size={18} />,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Album Awaiting Approval",
    description: "Kulkarni Family Event",
    time: "3 hours ago",
    icon: <Clock size={18} />,
    color: "bg-orange-100 text-orange-600",
  },
];

export default function RecentActivity() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest updates from your studio.
          </p>
        </div>

        <button className="text-sm font-medium text-[#0A3F61] hover:underline">
          View All
        </button>

      </div>

      <div className="divide-y divide-slate-100">

        {activities.map((activity) => (
          <div
            key={activity.title}
            className="flex items-start gap-4 px-6 py-5 transition-colors hover:bg-slate-50"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${activity.color}`}
            >
              {activity.icon}
            </div>

            <div className="flex-1">

              <h3 className="font-semibold text-slate-900">
                {activity.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {activity.description}
              </p>

            </div>

            <span className="whitespace-nowrap text-xs text-slate-400">
              {activity.time}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}