"use client";

type Props = {
  label: string;
  value: number;
  placeholder: string;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export default function PriceCard({
  label,
  value,
  placeholder,
  onChange,
  disabled = false,
}: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type="number"
        min={0}
        value={value === 0 ? "" : value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            Number(event.target.value) || 0,
          )
        }
        className="w-full rounded-2xl border border-slate-200 p-3 outline-none transition focus:border-[#0A3F61] disabled:bg-slate-100"
      />
    </div>
  );
}