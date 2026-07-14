import {
  CalendarDays,
  Camera,
  Image,
  PackageCheck,
  Sparkles,
  Truck,
} from "lucide-react";

const operations = [
  {
    title: "Events Today",
    value: "06",
    icon: CalendarDays,
    color: "bg-blue-100 text-[#0A3F61]",
  },
  {
    title: "Photos Uploaded",
    value: "12,482",
    icon: Camera,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "AI Processing",
    value: "18",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Gallery Approval",
    value: "05",
    icon: Image,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Albums Pending",
    value: "07",
    icon: PackageCheck,
    color: "bg-pink-100 text-pink-600",
  },
  {
    title: "Deliveries Today",
    value: "09",
    icon: Truck,
    color: "bg-cyan-100 text-cyan-600",
  },
];

export default function TodaysOperations() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-slate-900">
         Today&apos;s Operations
        </h2>

        <p className="mt-2 text-slate-500">
          Live operational activity across your studio.
        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {operations.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:border-[#0A3F61]/20 hover:shadow-md"
            >

              <div className="flex items-center gap-4">

                <div className={`rounded-2xl p-3 ${item.color}`}>

                  <Icon size={20} />

                </div>

                <div>

                  <h3 className="font-medium text-slate-800">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Today&apos;s Activity
                  </p>

                </div>

              </div>

              <span className="text-2xl font-bold text-slate-900">
                {item.value}
              </span>

            </div>

          );

        })}

      </div>

    </section>
  );
}