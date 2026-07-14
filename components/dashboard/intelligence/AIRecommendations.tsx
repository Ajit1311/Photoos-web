import {
  BrainCircuit,
  ChevronRight,
  Sparkles,
  CircleCheckBig,
  TriangleAlert,
} from "lucide-react";

const recommendations = [
  {
    title: "Run AI Face Recognition",
    description: "1,248 newly uploaded photos are waiting.",
    status: "Recommended",
    icon: Sparkles,
    color: "bg-blue-100 text-[#0A3F61]",
  },
  {
    title: "Publish 5 Approved Galleries",
    description: "Clients are waiting for gallery access.",
    status: "Ready",
    icon: CircleCheckBig,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Collect Pending Payments",
    description: "₹1,25,000 is pending from four clients.",
    status: "Attention",
    icon: TriangleAlert,
    color: "bg-orange-100 text-orange-600",
  },
];

export default function AIRecommendations() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            AI Recommendations
          </h2>

          <p className="mt-2 text-slate-500">
            Smart suggestions generated for your studio.
          </p>

        </div>

        <div className="rounded-2xl bg-[#0A3F61]/10 p-4 text-[#0A3F61]">

          <BrainCircuit size={24} />

        </div>

      </div>

      <div className="space-y-4">

        {recommendations.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:border-[#0A3F61]/20 hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div className="flex gap-4">

                  <div className={`rounded-2xl p-3 ${item.color}`}>

                    <Icon size={20} />

                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                  </div>

                </div>

                <button className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-50">

                  <ChevronRight size={18} />

                </button>

              </div>

              <div className="mt-5">

                <span className="rounded-full bg-[#0A3F61]/10 px-3 py-2 text-sm font-medium text-[#0A3F61]">

                  {item.status}

                </span>

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
}