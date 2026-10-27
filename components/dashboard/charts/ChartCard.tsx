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
    <section className="rounded-2xl border border-border/80 bg-card shadow-[0_4px_24px_rgba(10,63,97,0.045)] transition-all duration-300 hover:border-primary/15 hover:shadow-[0_12px_32px_rgba(10,63,97,0.08)]">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-6 sm:py-5">

        <div>

          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}

        </div>

        <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">

          {actionLabel}

          <ArrowUpRight size={16} />

        </button>

      </div>

      {/* Content */}

      <div className="p-4 sm:p-6">

        {children}

      </div>

    </section>
  );
}