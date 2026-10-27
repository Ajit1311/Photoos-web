"use client";

import { Badge } from "@/components/ui/badge";

type ProjectStatusBadgeProps = {
  status: string;
};

const STATUS_STYLES: Record<
  string,
  string
> = {
  draft:
    "bg-slate-100 text-slate-700 border-slate-200",

  inquiry:
    "bg-amber-100 text-amber-700 border-amber-200",

  confirmed:
    "bg-blue-100 text-blue-700 border-blue-200",

  in_progress:
    "bg-violet-100 text-violet-700 border-violet-200",

  completed:
    "bg-green-100 text-green-700 border-green-200",

  delivered:
    "bg-emerald-100 text-emerald-700 border-emerald-200",

  cancelled:
    "bg-red-100 text-red-700 border-red-200",
};

function formatStatus(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

export function ProjectStatusBadge({
  status,
}: ProjectStatusBadgeProps) {

  const normalized =
    status.toLowerCase();

  return (
    <Badge
      variant="outline"
      className={
        STATUS_STYLES[
          normalized
        ] ??
        "bg-muted text-foreground"
      }
    >
      {formatStatus(
        normalized,
      )}
    </Badge>
  );

}