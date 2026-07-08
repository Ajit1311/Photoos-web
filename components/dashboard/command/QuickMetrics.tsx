import {
  TrendingUp,
  Camera,
  Image,
  Users,
} from "lucide-react";

const metrics = [
  {
    title: "Today's Bookings",
    value: "06",
    icon: Camera,
    color: "bg-blue-100 text-[#0A3F61]",
  },
  {
    title: "Photos Uploaded",
    value: "12,482",
    icon: Image,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "New Clients",
    value: "14",
    icon: Users,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Growth",
    value: "+18%",
    icon: TrendingUp,
    color: "bg-orange-100 text-orange-600",
  },
];

export default function QuickMetrics() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-bold text-slate-900">
          Quick Metrics
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Today's studio performance
        </p>

      </div>

      <div className="grid grid-cols-2 gap-4">

        {metrics.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 p-4 transition hover:shadow-md"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs text-slate-500">
                    {item.title}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    {item.value}
                  </h3>

                </div>

                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={18} />
                </div>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}