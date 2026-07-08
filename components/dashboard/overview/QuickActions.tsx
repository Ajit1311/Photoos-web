import {
  Plus,
  Upload,
  Users,
  FolderPlus,
  QrCode,
  Sparkles,
} from "lucide-react";

const actions = [
  {
    title: "New Event",
    icon: <Plus size={20} />,
    primary: true,
  },
  {
    title: "Upload Photos",
    icon: <Upload size={20} />,
  },
  {
    title: "Create Gallery",
    icon: <FolderPlus size={20} />,
  },
  {
    title: "Add Client",
    icon: <Users size={20} />,
  },
  {
    title: "Generate QR",
    icon: <QrCode size={20} />,
  },
  {
    title: "Run AI Scan",
    icon: <Sparkles size={20} />,
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-xl font-bold text-slate-900">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Frequently used studio shortcuts.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-4">

        {actions.map((action) => (
          <button
            key={action.title}
            className={`group flex flex-col items-center justify-center rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
              action.primary
                ? "border-[#0A3F61] bg-[#0A3F61] text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-[#0A3F61]/20 hover:bg-slate-50"
            }`}
          >
            <div
              className={`mb-3 rounded-2xl p-3 ${
                action.primary
                  ? "bg-white/15"
                  : "bg-[#0A3F61]/10 text-[#0A3F61]"
              }`}
            >
              {action.icon}
            </div>

            <span className="text-sm font-semibold">
              {action.title}
            </span>
          </button>
        ))}

      </div>

    </div>
  );
}