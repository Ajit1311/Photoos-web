import {
  ArrowRight,
  Camera,
  FolderPlus,
  Image,
  QrCode,
  Send,
  Sparkles,
} from "lucide-react";

const actions = [
  {
    title: "Upload Photos",
    description: "Upload RAW or edited photos",
    icon: Camera,
    color: "bg-[#0A3F61]",
  },
  {
    title: "Run AI",
    description: "Start AI face recognition",
    icon: Sparkles,
    color: "bg-purple-600",
  },
  {
    title: "Generate QR",
    description: "Create gallery QR code",
    icon: QrCode,
    color: "bg-green-600",
  },
  {
    title: "Create Album",
    description: "Design printable album",
    icon: FolderPlus,
    color: "bg-orange-500",
  },
  {
    title: "Publish Gallery",
    description: "Publish client gallery",
    icon: Image,
    color: "bg-cyan-600",
  },
  {
    title: "Share Gallery",
    description: "Send gallery to client",
    icon: Send,
    color: "bg-pink-600",
  },
];

export default function EventQuickActions() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6">

        <h2 className="text-2xl font-bold text-slate-900">
          Event Quick Actions
        </h2>

        <p className="mt-2 text-slate-500">
          Everything required to manage this event.
        </p>

      </div>

      <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">

        {actions.map((action) => {

          const Icon = action.icon;

          return (

            <button
              key={action.title}
              className="group rounded-2xl border border-slate-200 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#0A3F61] hover:shadow-lg"
            >

              <div
                className={`mb-5 inline-flex rounded-2xl p-4 text-white ${action.color}`}
              >
                <Icon size={22} />
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                {action.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {action.description}
              </p>

              <div className="mt-5 flex items-center gap-2 font-medium text-[#0A3F61]">

                Open

                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />

              </div>

            </button>

          );

        })}

      </div>

    </section>
  );
}