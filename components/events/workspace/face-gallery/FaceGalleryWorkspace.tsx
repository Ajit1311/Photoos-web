"use client";

import {
  Users,
  Image,
  Send,
  ShieldCheck,
  ScanFace,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  useFaceGalleryDashboard,
} from "@/hooks/useFaceGalleryDashboard";

import type {
  FaceGalleryEnrollment,
  FaceGalleryMatch,
  FaceGalleryDelivery,
  FaceGalleryLifecycleSummary,
} from "@/types/face-gallery";


interface FaceGalleryWorkspaceProps {

  eventId:
    string;

  workspaceId:
    string
    | null;

}


function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon:
    React.ComponentType<{
      className?: string;
    }>;

  label:
    string;

  value:
    number;

  description:
    string;
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {value}
          </p>

        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-[#0A3F61]">

          <Icon className="h-5 w-5" />

        </div>

      </div>

      <p className="mt-4 text-xs text-slate-500">
        {description}
      </p>

    </div>

  );

}


function EmptyState({
  title,
  description,
}: {
  title:
    string;

  description:
    string;
}) {

  return (

    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">

      <div className="rounded-2xl bg-slate-100 p-3">

        <ScanFace className="h-5 w-5 text-slate-500" />

      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>

  );

}


function Section({
  title,
  children,
}: {
  title:
    string;

  children:
    React.ReactNode;
}) {

  return (

    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-base font-semibold text-slate-900">
        {title}
      </h2>

      <div className="mt-5">

        {children}

      </div>

    </section>

  );

}


function IdText({
  value,
}: {
  value:
    string;
}) {

  return (

    <p className="truncate font-mono text-xs text-slate-500">

      {value}

    </p>

  );

}


export default function FaceGalleryWorkspace({
  eventId,
  workspaceId,
}: FaceGalleryWorkspaceProps) {

  const {
    data,
    loading,
    refreshing,
    error,
    refresh,
  } =
    useFaceGalleryDashboard(
      workspaceId,
    );


  if (
    !workspaceId
  ) {

    return (

      <div className="space-y-6">

        <div>

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-[#0A3F61] p-3 text-white">

              <ScanFace className="h-6 w-6" />

            </div>

            <div>

              <h1 className="text-xl font-bold text-slate-900">
                Client Face Gallery
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Event workspace configuration is incomplete.
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">

          <div className="flex items-start gap-4">

            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>

              <h2 className="text-sm font-semibold text-amber-900">
                Workspace ID is not available
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                This event does not currently provide a workspace ID.
                Face Gallery data cannot be queried until the event workspace
                is connected.
              </p>

              <p className="mt-4 font-mono text-xs text-amber-700">
                Event ID: {eventId}
              </p>

            </div>

          </div>

        </div>

      </div>

    );

  }


  if (
    loading
  ) {

    return (

      <div className="space-y-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-[#0A3F61] p-3 text-white">

            <ScanFace className="h-6 w-6" />

          </div>

          <div>

            <h1 className="text-xl font-bold text-slate-900">
              Client Face Gallery
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Loading Face Gallery data.
            </p>

          </div>

        </div>

        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">

          <div className="text-center">

            <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#0A3F61]" />

            <p className="mt-4 text-sm text-slate-500">
              Loading enrollments, matches, deliveries, and lifecycle activity.
            </p>

          </div>

        </div>

      </div>

    );

  }


  if (
    error
  ) {

    return (

      <div className="space-y-6">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-[#0A3F61] p-3 text-white">

            <ScanFace className="h-6 w-6" />

          </div>

          <div>

            <h1 className="text-xl font-bold text-slate-900">
              Client Face Gallery
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Workspace data could not be loaded.
            </p>

          </div>

        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-4">

            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />

            <div className="min-w-0 flex-1">

              <h2 className="font-semibold text-red-900">
                Unable to load Face Gallery
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-700">
                {error.message}
              </p>

              <button
                type="button"
                onClick={() =>
                  void refresh()
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white"
              >

                <RefreshCw className="h-4 w-4" />

                Retry

              </button>

            </div>

          </div>

        </div>

      </div>

    );

  }


  const metrics =
    data?.metrics ?? {

      enrollments:
        0,

      matchedResults:
        0,

      deliveries:
        0,

      lifecycleEvents:
        0,

    };


  const enrollments =
    data?.enrollments ??
    [];


  const matches =
    data?.matches ??
    [];


  const deliveries =
    data?.deliveries ??
    [];


  const lifecycleSummaries =
    data?.lifecycleSummaries ??
    [];


  return (

    <div className="space-y-6">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-[#0A3F61] p-3 text-white">

            <ScanFace className="h-6 w-6" />

          </div>

          <div>

            <h1 className="text-xl font-bold text-slate-900">
              Client Face Gallery
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Face recognition, matches, delivery, and lifecycle activity.
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            void refresh()
          }
          disabled={
            refreshing
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >

          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh

        </button>

      </div>


      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          icon={Users}
          label="Enrollments"
          value={
            metrics.enrollments
          }
          description="Client face profiles"
        />

        <MetricCard
          icon={Image}
          label="Matched Results"
          value={
            metrics.matchedResults
          }
          description="Recognized assets"
        />

        <MetricCard
          icon={Send}
          label="Deliveries"
          value={
            metrics.deliveries
          }
          description="Gallery deliveries"
        />

        <MetricCard
          icon={ShieldCheck}
          label="Lifecycle Events"
          value={
            metrics.lifecycleEvents
          }
          description="Delivery lifecycle activity"
        />

      </div>


      <div className="grid gap-6 xl:grid-cols-2">

        <Section
          title="Face Enrollments"
        >

          {enrollments.length ===
          0
            ? (
              <EmptyState
                title="No face enrollments"
                description="Client face enrollments for this event will appear here."
              />
            )
            : (
              <div className="space-y-3">

                {enrollments.map(
                  (
                    enrollment:
                      FaceGalleryEnrollment,
                  ) => (

                    <div
                      key={
                        enrollment.id
                      }
                      className="rounded-xl border border-slate-100 p-4"
                    >

                      <IdText
                        value={
                          enrollment.id
                        }
                      />

                      <div className="mt-3 flex items-center justify-between gap-3">

                        <span className="text-sm font-medium text-slate-900">
                          {enrollment.enrollmentStatus}
                        </span>

                      </div>

                    </div>

                  ),
                )}

              </div>
            )}

        </Section>


        <Section
          title="Recognition Matches"
        >

          {matches.length ===
          0
            ? (
              <EmptyState
                title="No recognition matches"
                description="Matched assets will appear here after face recognition processing."
              />
            )
            : (
              <div className="space-y-3">

                {matches.map(
                  (
                    match:
                      FaceGalleryMatch,
                  ) => (

                    <div
                      key={
                        match.matchId
                      }
                      className="rounded-xl border border-slate-100 p-4"
                    >

                      <IdText
                        value={
                          match.matchId
                        }
                      />

                      <div className="mt-3 flex items-center justify-between">

                        <span className="text-sm font-medium text-slate-700">
                          Score
                        </span>

                        <span className="text-sm font-semibold text-slate-900">
                          {match.similarityScore}
                        </span>

                      </div>

                    </div>

                  ),
                )}

              </div>
            )}

        </Section>


        <Section
          title="Gallery Deliveries"
        >

          {deliveries.length ===
          0
            ? (
              <EmptyState
                title="No deliveries"
                description="Delivered face gallery results will appear here."
              />
            )
            : (
              <div className="space-y-3">

                {deliveries.map(
                  (
                    delivery:
                      FaceGalleryDelivery,
                  ) => (

                    <div
                      key={
                        delivery.deliveryId
                      }
                      className="rounded-xl border border-slate-100 p-4"
                    >

                      <IdText
                        value={
                          delivery.deliveryId
                        }
                      />

                      <p className="mt-3 text-sm font-medium text-slate-900">
                        {delivery.deliveryStatus}
                      </p>

                    </div>

                  ),
                )}

              </div>
            )}

        </Section>


        <Section
          title="Delivery Lifecycle"
        >

          {lifecycleSummaries.length ===
          0
            ? (
              <EmptyState
                title="No lifecycle activity"
                description="Delivery lifecycle events will appear here."
              />
            )
            : (
              <div className="space-y-3">

                {lifecycleSummaries.map(
                  (
                    summary:
                      FaceGalleryLifecycleSummary,
                  ) => (

                    <div
                      key={
                        summary.enrollmentId
                      }
                      className="rounded-xl border border-slate-100 p-4"
                    >

                      <IdText
                        value={
                          summary.enrollmentId
                        }
                      />

                      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">

                        <div>

                          <p className="text-slate-500">
                            Created
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {summary.createdEvents}
                          </p>

                        </div>

                        <div>

                          <p className="text-slate-500">
                            Delivered
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {summary.deliveredEvents}
                          </p>

                        </div>

                        <div>

                          <p className="text-slate-500">
                            Revoked
                          </p>

                          <p className="mt-1 font-semibold text-slate-900">
                            {summary.revokedEvents}
                          </p>

                        </div>

                      </div>

                    </div>

                  ),
                )}

              </div>
            )}

        </Section>

      </div>

    </div>

  );

}
