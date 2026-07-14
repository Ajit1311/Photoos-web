type Props = {
  label: string;
  placeholder: string;
};

export default function PriceCard({
  label,
  placeholder,
}: Props) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type="number"
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 p-3 outline-none transition focus:border-[#0A3F61]"
      />

    </div>
  );
}