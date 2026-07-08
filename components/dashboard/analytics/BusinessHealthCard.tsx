export default function BusinessHealthCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Business Health
          </p>

          <h2 className="mt-2 text-4xl font-bold text-[#0A3F61]">
            92%
          </h2>

          <p className="mt-2 text-sm text-green-600">
            Excellent Performance
          </p>
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0A3F61]/10">
          <span className="text-xl font-bold text-[#0A3F61]">
            92
          </span>
        </div>
      </div>
    </div>
  );
}