type Props = {
  title: string;
  description: string;
};

export default function SwitchCard({
  title,
  description,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-5">

      <div>

        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>

      </div>

      <button className="h-7 w-12 rounded-full bg-slate-300 p-1 transition">

        <div className="h-5 w-5 rounded-full bg-white shadow" />

      </button>

    </div>
  );
}