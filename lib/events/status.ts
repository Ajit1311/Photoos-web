export const STATUS_FLOW = [
  "active",
  "selection_started",
  "selected",
  "editing",
  "editing_completed",
  "album_ready",
  "delivered",
  "completed",
] as const;

export function canMoveToStatus(
  current: string,
  target: string
): boolean {
  const currentIndex = STATUS_FLOW.indexOf(current as any);
  const targetIndex = STATUS_FLOW.indexOf(target as any);

  if (currentIndex === -1 || targetIndex === -1) return false;

  if (targetIndex < currentIndex) return false;

  return true;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "selection_started":
      return "bg-orange-100 text-orange-700 border border-orange-200";

    case "selected":
      return "bg-amber-100 text-amber-700 border border-amber-200";

    case "editing":
      return "bg-blue-100 text-blue-700 border border-blue-200";

    case "editing_completed":
      return "bg-indigo-100 text-indigo-700 border border-indigo-200";

    case "album_ready":
      return "bg-purple-100 text-purple-700 border border-purple-200";

    case "delivered":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";

    case "completed":
      return "bg-green-100 text-green-700 border border-green-200";

    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}