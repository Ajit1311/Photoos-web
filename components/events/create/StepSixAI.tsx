"use client";

import AIFeatureCard from "./AIFeatureCard";

import { useEventWizard } from "@/context/EventWizardContext";

export default function StepSixAI() {
  const { data, setField } = useEventWizard();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">
        AI Settings
      </h2>

      <p className="mt-2 text-slate-500">
        Choose which AI services should run automatically for this event.
      </p>

      <div className="mt-8 space-y-5">
        <AIFeatureCard
          title="Face Recognition"
          description="Automatically identify and group photos by person."
          recommended
          checked={data.faceRecognition}
          onChange={(value) =>
            setField("faceRecognition", value)
          }
        />

        <AIFeatureCard
          title="Duplicate Detection"
          description="Detect duplicate and visually similar photos."
          recommended
          checked={data.duplicateDetection}
          onChange={(value) =>
            setField("duplicateDetection", value)
          }
        />

        <AIFeatureCard
          title="Blur Detection"
          description="Detect blurred or unusable photos."
          recommended
          checked={data.blurDetection}
          onChange={(value) =>
            setField("blurDetection", value)
          }
        />

        <AIFeatureCard
          title="Best Photo Selection"
          description="Suggest the best photos for delivery and album creation."
          recommended
          checked={data.bestPhotoSelection}
          onChange={(value) =>
            setField("bestPhotoSelection", value)
          }
        />

        <AIFeatureCard
          title="Album Suggestions"
          description="Recommend photos for album design."
          checked={data.albumSuggestions}
          onChange={(value) =>
            setField("albumSuggestions", value)
          }
        />

        <AIFeatureCard
          title="Smart Tag Generation"
          description="Automatically generate searchable tags for photos."
          checked={data.smartTagGeneration}
          onChange={(value) =>
            setField("smartTagGeneration", value)
          }
        />
      </div>
    </div>
  );
}