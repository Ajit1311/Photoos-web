import { Sparkles } from "lucide-react";

export default function AIInsights() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0A3F61] via-[#155983] to-[#3495A1] p-7 text-white shadow-xl">

      <div className="flex items-center gap-3">

        <Sparkles />

        <h2 className="text-xl font-semibold">
          AI Insights
        </h2>

      </div>

      <div className="mt-7 space-y-5">

        <div>
          <p className="text-white/70">
            Pending AI Jobs
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            32
          </h3>
        </div>

        <div>
          <p className="text-white/70">
            Recommendation
          </p>

          <p className="mt-2 leading-7">
            Publish Rahul Wedding Gallery today to
            improve delivery performance.
          </p>
        </div>

      </div>

    </div>
  );
}