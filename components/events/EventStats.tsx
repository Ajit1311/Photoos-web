import {
  CalendarDays,
  Camera,
  Images,
  Wallet,
} from "lucide-react";

const stats = [
  {
    title: "Total Events",
    value: "148",
    icon: CalendarDays,
    color: "bg-blue-100 text-[#0A3F61]",
  },
  {
    title: "Today's Shoots",
    value: "06",
    icon: Camera,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Published Galleries",
    value: "92",
    icon: Images,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Pending Payments",
    value: "₹2.45L",
    icon: Wallet,
    color: "bg-orange-100 text-orange-600",
  },
];

export default function EventStats() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {stats.map((item) => {

        const Icon = item.icon;

        return (

          <div
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-900">
                  {item.value}
                </h2>

              </div>

              <div className={`rounded-2xl p-4 ${item.color}`}>

                <Icon size={24} />

              </div>

            </div>

          </div>

        );

      })}

    </section>
  );
}