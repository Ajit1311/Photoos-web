export default function RevenueGoalTracker() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0A3F61] to-[#155983] p-6 text-white shadow-lg">

      <p className="text-white/70">
        Monthly Goal
      </p>

      <h2 className="mt-2 text-5xl font-bold">
        72%
      </h2>

      <div className="mt-8">

        <div className="mb-2 flex justify-between text-sm">

          <span>
            ₹28.4L
          </span>

          <span>
            ₹40L
          </span>

        </div>

        <div className="h-3 rounded-full bg-white/20">

          <div className="h-full w-[72%] rounded-full bg-white" />

        </div>

      </div>

      <p className="mt-6 leading-7 text-white/80">
        Keep current growth rate to achieve the monthly target before schedule.
      </p>

    </div>
  );
}