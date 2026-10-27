import { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0A3F61]/20 hover:shadow-xl">

      {/* Top Accent */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0A3F61] via-[#3495A1] to-[#EF8619]" />

      <div className="flex items-start justify-between">

        {/* Left */}

        <div className="flex-1">

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

          <div className="mt-5 flex items-center gap-2">

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
              <TrendingUp size={14} className="text-green-600" />
            </div>

            <span className="text-sm font-medium text-green-600">
              {subtitle}
            </span>

          </div>

        </div>

        {/* Icon */}

        <div className="rounded-2xl bg-gradient-to-br from-[#0A3F61]/10 to-[#3495A1]/10 p-4 text-[#0A3F61] transition-transform duration-300 group-hover:scale-110">

          {icon}

        </div>

      </div>

    </div>
  );
}