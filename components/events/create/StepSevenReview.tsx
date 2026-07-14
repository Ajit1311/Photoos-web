"use client";

import { useEventWizard } from "@/context/EventWizardContext";

import ReviewCard from "./ReviewCard";

export default function StepSevenReview() {
  const { data } = useEventWizard();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold text-slate-900">
        Review Event
      </h2>

      <p className="mt-2 text-slate-500">
        Verify all details before creating the event.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">

        <ReviewCard
          title="Event"
          value={
            data.title ||
            "Not specified"
          }
        />

        <ReviewCard
          title="Client"
          value={
            data.clientName ||
            "Not specified"
          }
        />

        <ReviewCard
          title="Package"
          value={
            data.packageAmount > 0
              ? `₹${data.packageAmount.toLocaleString()}`
              : "Not specified"
          }
        />

        <ReviewCard
          title="Photographer"
          value={
            data.photographerIds.length > 0
              ? `${data.photographerIds.length} selected`
              : "Not assigned"
          }
        />

        <ReviewCard
          title="Payment"
          value={
            data.advanceAmount > 0
              ? `₹${data.advanceAmount.toLocaleString()} Advance`
              : "Pending"
          }
        />

        <ReviewCard
          title="AI Processing"
          value={
            data.faceRecognition
              ? "Enabled"
              : "Disabled"
          }
        />

        <ReviewCard
          title="Gallery"
          value={
            data.allowDownload
              ? "Downloads Enabled"
              : "Downloads Locked"
          }
        />

        <ReviewCard
          title="Status"
          value="Ready to Create"
        />

      </div>

      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

        <h3 className="font-semibold text-emerald-700">
          Everything looks good.
        </h3>

        <p className="mt-2 text-sm text-emerald-600">
          Click <strong>Create Event</strong> to generate the event, gallery,
          AI workflow and client workspace.
        </p>

      </div>

    </div>
  );
}