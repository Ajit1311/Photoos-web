type BadgeType =
  | "success"
  | "warning"
  | "processing"
  | "draft"
  | "danger";

type Props = {
  label: string;
  type: BadgeType;
};

const styles = {
  success:
    "bg-green-100 text-green-700 border-green-200",

  warning:
    "bg-orange-100 text-orange-700 border-orange-200",

  processing:
    "bg-blue-100 text-[#0A3F61] border-blue-200",

  draft:
    "bg-slate-100 text-slate-700 border-slate-200",

  danger:
    "bg-red-100 text-red-700 border-red-200",
};

export default function EventStatusBadge({
  label,
  type,
}: Props) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[type]}`}
    >
      {label}
    </span>
  );
}