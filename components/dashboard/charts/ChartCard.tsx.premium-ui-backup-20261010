import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

type ChartCardProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  children: ReactNode;
};

export default function ChartCard({
  title,
  subtitle,
  actionLabel = "View Report",
  children,
}: ChartCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}

        </div>

        <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-[#0A3F61] transition hover:border-[#0A3F61] hover:bg-[#0A3F61] hover:text-white">

          {actionLabel}

          <ArrowUpRight size={16} />

        </button>

      </div>

      {/* Content */}

      <div className="p-6">

        {children}

      </div>

    </section>
  );
}