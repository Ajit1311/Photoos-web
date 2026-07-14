type Props = {
  title: string;
  value: string;
};

export default function ReviewCard({
  title,
  value,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h3 className="mt-2 text-lg font-semibold text-slate-900">
        {value}
      </h3>

    </div>
  );
}