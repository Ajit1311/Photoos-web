'use client';

import { 
  Camera, 
  Sparkles, 
  QrCode, 
  FolderPlus, 
  Globe, 
  Share2,
  ArrowRight
} from "lucide-react";

const actions = [
  {
    id: "upload",
    title: "Upload Photos",
    desc: "RAW or edited photos",
    icon: <Camera size={20} />,
    color: "bg-blue-500",
  },
  {
    id: "ai",
    title: "Run AI",
    desc: "Face recognition",
    icon: <Sparkles size={20} />,
    color: "bg-purple-500",
  },
  {
    id: "qr",
    title: "Generate QR",
    desc: "Gallery QR code",
    icon: <QrCode size={20} />,
    color: "bg-emerald-500",
  },
  {
    id: "album",
    title: "Create Album",
    desc: "Design printable layouts",
    icon: <FolderPlus size={20} />,
    color: "bg-amber-500",
  },
  {
    id: "publish",
    title: "Publish Gallery",
    desc: "Make client gallery live",
    icon: <Globe size={20} />,
    color: "bg-cyan-500",
  },
  {
    id: "share",
    title: "Share Gallery",
    desc: "Send link to client",
    icon: <Share2 size={20} />,
    color: "bg-pink-500",
  },
];

export default function EventQuickActions() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Event Quick Actions</h2>
        <p className="text-sm text-slate-500 mt-1">Everything required to manage this event.</p>
      </div>

      {/* Horizontal List View */}
      <div className="flex flex-col gap-3.5">
        {actions.map((action) => (
          <div 
            key={action.id}
            className="group relative flex items-center justify-between p-3.5 rounded-2xl border-2 border-[#0A3F61]/20 bg-slate-50/30 hover:border-[#0A3F61] hover:bg-gradient-to-r hover:from-[#0A3F61]/5 hover:to-[#0A3F61]/0 transition-all duration-300 cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-4">
              {/* Icon Holder */}
              <div className={`flex items-center justify-center p-3 rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${action.color}`}>
                {action.icon}
              </div>
              
              {/* Text Meta */}
              <div>
                <h4 className="text-sm font-bold text-[#0A3F61] transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {action.desc}
                </p>
              </div>
            </div>

            {/* Action Trigger Link */}
            <div className="flex items-center gap-1 text-xs font-bold text-[#0A3F61]/70 group-hover:text-[#0A3F61] transition-colors px-3 py-1.5 rounded-xl group-hover:bg-[#0A3F61]/10 border border-transparent group-hover:border-[#0A3F61]/20">
              <span>Open</span>
              <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}