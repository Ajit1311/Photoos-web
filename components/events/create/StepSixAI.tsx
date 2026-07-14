import AIFeatureCard from "./AIFeatureCard";

export default function StepSixAI() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold text-slate-900">
        AI Settings
      </h2>

      <p className="mt-2 text-slate-500">
        Choose which AI features should run automatically for this event.
      </p>

      <div className="mt-8 space-y-5">

        <AIFeatureCard
          title="Face Recognition"
          description="Automatically identify and group photos by person."
          recommended
        />

        <AIFeatureCard
          title="Duplicate Detection"
          description="Find duplicate and similar photos."
          recommended
        />

        <AIFeatureCard
          title="Blur Detection"
          description="Detect blurry or unusable images."
          recommended
        />

        <AIFeatureCard
          title="Best Photo Selection"
          description="Suggest the best photos automatically."
          recommended
        />

        <AIFeatureCard
          title="AI Color Enhancement"
          description="Improve exposure, colors and contrast."
        />

        <AIFeatureCard
          title="Album Suggestions"
          description="Recommend photos for album design."
        />

      </div>

    </div>
  );
}