"use client";

type Props = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  recommended?: boolean;
};

export default function AIFeatureCard({
  title,
  description,
  checked,
  onChange,
  recommended = false,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 transition hover:border-[#0A3F61]/20 hover:shadow-md">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">
              {title}
            </h3>

            {recommended && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                Recommended
              </span>
            )}
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
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
    </div>
  );
}