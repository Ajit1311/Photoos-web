import {
  CheckCircle2,
  Camera,
  Sparkles,
  Image,
  PackageCheck,
} from "lucide-react";

const timeline = [
  {
    title: "Event Completed",
    description: "Rahul & Priya Wedding Shoot",
    time: "09:30 AM",
    icon: Camera,
    color: "bg-blue-100 text-[#0A3F61]",
  },
  {
    title: "Photos Uploaded",
    description: "1,248 RAW photos uploaded",
    time: "11:15 AM",
    icon: Image,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "AI Processing Finished",
    description: "Face indexing completed successfully",
    time: "12:40 PM",
    icon: Sparkles,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Gallery Published",
    description: "Client gallery is now live",
    time: "03:10 PM",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Album Sent For Printing",
    description: "Premium Album • 40 Pages",
    time: "05:00 PM",
    icon: PackageCheck,
    color: "bg-emerald-100 text-emerald-600",
  },
];

export default function ActivityTimeline() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-slate-100 px-6 py-5">

        <h2 className="text-xl font-bold text-slate-900">
          Activity Timeline
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Live production workflow
        </p>

      </div>

      {/* Timeline */}

      <div className="relative px-8 py-6">

        <div className="absolute left-[43px] top-10 bottom-10 w-px bg-slate-200"></div>

        <div className="space-y-8">

          {timeline.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="relative flex gap-5"
              >
                {/* Timeline Icon */}

                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${item.color}`}
                >
                  <Icon size={18} />
                </div>

                {/* Content */}

                <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:border-[#0A3F61]/20 hover:bg-white hover:shadow-sm">

                  <div className="flex items-center justify-between">

                    <h3 className="font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <span className="text-xs text-slate-400">
                      {item.time}
                    </span>

                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.description}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">

        <button className="w-full rounded-2xl border border-[#0A3F61] py-3 font-semibold text-[#0A3F61] transition-all hover:bg-[#0A3F61] hover:text-white">
          View Complete Timeline
        </button>

      </div>

    </div>
  );
}