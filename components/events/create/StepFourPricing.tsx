import PriceCard from "./PriceCard";

export default function StepFourPricing() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold text-slate-900">
        Pricing & Payment
      </h2>

      <p className="mt-2 text-slate-500">
        Configure the commercial details for this event.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        <PriceCard
          label="Package Amount"
          placeholder="50000"
        />

        <PriceCard
          label="Advance Received"
          placeholder="20000"
        />

        <PriceCard
          label="Discount"
          placeholder="0"
        />

        <PriceCard
          label="Balance Amount"
          placeholder="30000"
        />

        <div>

          <label className="mb-2 block text-sm font-medium">
            Payment Due Date
          </label>

          <input
            type="date"
            className="w-full rounded-2xl border border-slate-200 p-3"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium">
            Payment Status
          </label>

          <select className="w-full rounded-2xl border border-slate-200 p-3">

            <option>Pending</option>
            <option>Advance Paid</option>
            <option>Fully Paid</option>

          </select>

        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-[#0A3F61]/5 p-5">

        <h3 className="font-semibold text-[#0A3F61]">
          Payment Summary
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">

          <div>

            <p className="text-sm text-slate-500">
              Total
            </p>

            <p className="text-xl font-bold">
              ₹50,000
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Received
            </p>

            <p className="text-xl font-bold text-green-600">
              ₹20,000
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Balance
            </p>

            <p className="text-xl font-bold text-orange-600">
              ₹30,000
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}