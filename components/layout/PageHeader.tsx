"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/events": "Events",
  "/dashboard/events/create": "Create Event",
  "/dashboard/clients": "Clients",
  "/dashboard/galleries": "Galleries",
  "/dashboard/albums": "Albums",
  "/dashboard/assets": "Assets",
  "/dashboard/ai": "AI Processing",
  "/dashboard/payments": "Payments",
  "/dashboard/team": "Team",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export default function PageHeader() {
  const pathname = usePathname();

  const title = titles[pathname] ?? "Dashboard";

  return (
    <div className="mb-6 space-y-1">

      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>

      <p className="text-sm leading-6 text-muted-foreground sm:text-base">
        Welcome back to PhotoOS.
      </p>

    </div>
  );
}