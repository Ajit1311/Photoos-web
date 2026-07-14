type Props = {
  title: string;
  placeholder: string;
};

export default function MemberCard({
  title,
  placeholder,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <input
        className="mt-4 w-full rounded-xl border border-slate-200 p-3"
        placeholder={placeholder}
      />

    </div>
  );
}