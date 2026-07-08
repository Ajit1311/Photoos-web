import {
  Sparkles,
  ArrowRight,
} from "lucide-react";

const recommendations = [
  "Publish Rahul Wedding Gallery today.",
  "Send payment reminder to 3 clients.",
  "Archive 42 GB completed projects.",
  "Run AI face indexing for Corporate Event.",
];

export default function AIRecommendationEngine() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0A3F61] via-[#155983] to-[#3495A1] p-6 text-white shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-white/70">
            AI Recommendation Engine
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Smart Suggestions
          </h2>

        </div>

        <Sparkles size={28} />

      </div>

      <div className="mt-8 space-y-4">

        {recommendations.map((item) => (

          <div
            key={item}
            className="rounded-2xl bg-white/10 p-4"
          >

            <div className="flex items-start justify-between gap-3">

              <p className="text-sm leading-6">
                {item}
              </p>

              <ArrowRight size={18} />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}