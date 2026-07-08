import {
  Bell,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const notifications = [
  {
    title: "Gallery Published Successfully",
    icon: <CheckCircle2 size={18} />,
    color: "text-green-600",
  },
  {
    title: "Payment Pending - Rahul Wedding",
    icon: <AlertTriangle size={18} />,
    color: "text-orange-500",
  },
  {
    title: "AI Processing Completed",
    icon: <Bell size={18} />,
    color: "text-[#0A3F61]",
  },
];

export default function NotificationCenter() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-bold">
        Notifications
      </h2>

      <div className="space-y-4">

        {notifications.map((item) => (

          <div
            key={item.title}
            className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"
          >

            <div className={item.color}>
              {item.icon}
            </div>

            <span className="text-sm font-medium text-slate-700">
              {item.title}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}