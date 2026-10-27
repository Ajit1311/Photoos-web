"use client";

type Props = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function SwitchCard({
  title,
  description,
  checked,
  onChange,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5">
      <div className="pr-4">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full p-1 transition ${
          checked
            ? "bg-[#0A3F61]"
            : "bg-slate-300"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked
              ? "translate-x-5"
              : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}