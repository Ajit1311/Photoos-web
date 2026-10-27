"use client";

import type {
  LucideIcon,
} from "lucide-react";

type ProjectStatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
};

export function ProjectStatCard({
  title,
  value,
  icon: Icon,
}: ProjectStatCardProps) {
  return (
    <div className="rounded-xl border bg-background p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <span className="text-sm text-muted-foreground">
          {title}
        </span>

        <Icon className="h-5 w-5 text-muted-foreground" />

      </div>

      <div className="mt-4">

        <p className="text-3xl font-bold tracking-tight">
          {value}
        </p>

      </div>

    </div>
  );
}