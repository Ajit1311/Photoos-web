import {
  Briefcase,
  Calendar,
  Users,
  Wallet,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const shortcuts = [
  {
    title: "Create Event",
    subtitle: "New Booking",
    icon: Calendar,
  },
  {
    title: "Clients",
    subtitle: "842 Active",
    icon: Users,
  },
  {
    title: "Revenue",
    subtitle: "₹28.4L",
    icon: Wallet,
  },
  {
    title: "AI Center",
    subtitle: "32 Jobs",
    icon: Sparkles,
  },
];

export default function StudioCommandCenter() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#0A3F61] via-[#155983] to-[#3495A1] p-7 text-white shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-white/70">
            Studio Command Center
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Everything at one place
          </h2>

        </div>

        <Briefcase size={34} />

      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">

        {shortcuts.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.title}
              className="rounded-2xl bg-white/10 p-5 text-left transition hover:bg-white/20"
            >

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/70">
                    {item.subtitle}
                  </p>

                </div>

                <Icon size={22} />

              </div>

            </button>

          );

        })}

      </div>

      <button className="mt-8 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-[#0A3F61] transition hover:scale-105">

        Open Studio Center

        <ArrowRight size={18} />

      </button>

    </section>
  );
}