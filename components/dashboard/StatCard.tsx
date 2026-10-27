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
    <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-[0_4px_24px_rgba(10,63,97,0.045)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_32px_rgba(10,63,97,0.10)] sm:p-6">

      {/* Top Accent */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0A3F61] via-[#3495A1] to-[#EF8619]" />

      <div className="flex items-start justify-between">

        {/* Left */}

        <div className="flex-1">

          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {value}
          </h2>

          <div className="mt-5 flex items-center gap-2">

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
              <TrendingUp size={14} className="text-emerald-700" />
            </div>

            <span className="text-sm font-medium text-green-600">
              {subtitle}
            </span>

          </div>

        </div>

        {/* Icon */}

        <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/10 via-[#3495A1]/10 to-[#1F70B8]/5 p-3.5 text-primary transition-transform duration-300 group-hover:scale-110">

          {icon}

        </div>

      </div>

    </div>
  );
}