"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  Loader2,
  RefreshCw,
  SquareX,
  Workflow,
} from "lucide-react";

import {
  cancelAiPipeline,
  getAiDashboardData,
} from "@/lib/api/ai";

import type {
  AiDashboardData,
  AiJob,
  AiPipelineRun,
  AiProcessingJob,
  AiProcessingResult,
} from "@/types/ai";

type AiWorkspaceTab =
  | "overview"
  | "jobs"
  | "pipelines"
  | "results";

type AiWorkspaceProps = {
  workspaceId?: string;
};

const tabs: {
  id: AiWorkspaceTab;
  label: string;
}[] = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "jobs",
    label: "Jobs",
  },
  {
    id: "pipelines",
    label: "Pipelines",
  },
  {
    id: "results",
    label: "Results",
  },
];

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatLabel(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );
}

function getStatusClass(
  status: string,
): string {
  const normalized =
    status.toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "success"
  ) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }

  if (
    normalized === "failed" ||
    normalized === "error"
  ) {
    return "bg-red-500/10 text-red-700 dark:text-red-400";
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return "bg-slate-500/10 text-slate-700 dark:text-slate-400";
  }

  if (
    normalized === "running" ||
    normalized === "processing" ||
    normalized === "in_progress"
  ) {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
  }

  return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
}

function StatusBadge(
  {
    status,
  }: {
    status: string;
  },
) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        getStatusClass(
          status,
        ),
      ].join(" ")}
    >
      {formatLabel(status)}
    </span>
  );
}

function MetricCard(
  {
    title,
    value,
    description,
    icon,
  }: {
    title: string;
    value: number;
    description: string;
    icon: React.ReactNode;
  },
) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-muted p-3">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AiWorkspace(
  {
    workspaceId,
  }: AiWorkspaceProps,
) {
  const [
    data,
    setData,
  ] =
    useState<AiDashboardData | null>(
      null,
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<AiWorkspaceTab>(
      "overview",
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    cancellingPipelineId,
    setCancellingPipelineId,
  ] =
    useState<string | null>(
      null,
    );

  const loadData =
    useCallback(
      async (
        showRefreshState = false,
      ) => {
        try {
          setError(null);

          if (showRefreshState) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const dashboardData =
            await getAiDashboardData();

          setData(
            dashboardData,
          );
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load AI processing data.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(
    () => {
      void loadData();
    },
    [
      loadData,
    ],
  );

  const visibleProcessingJobs =
    useMemo(
      () =>
        workspaceId
          ? (
              data?.processingJobs ??
              []
            ).filter(
              (
                job,
              ) =>
                job.workspaceId ===
                workspaceId,
            )
          : (
              data?.processingJobs ??
              []
            ),
      [
        data,
        workspaceId,
      ],
    );

  const visiblePipelineRuns =
    useMemo(
      () =>
        workspaceId
          ? (
              data?.pipelineRuns ??
              []
            ).filter(
              (
                pipeline,
              ) =>
                pipeline.workspaceId ===
                workspaceId,
            )
          : (
              data?.pipelineRuns ??
              []
            ),
      [
        data,
        workspaceId,
      ],
    );

  const visibleResults =
    useMemo(
      () =>
        workspaceId
          ? (
              data?.results ??
              []
            ).filter(
              (
                result,
              ) =>
                result.workspaceId ===
                workspaceId,
            )
          : (
              data?.results ??
              []
            ),
      [
        data,
        workspaceId,
      ],
    );

  const visibleJobs =
    useMemo(
      () =>
        data?.jobs ??
        [],
      [
        data,
      ],
    );

  const handleCancelPipeline =
    useCallback(
      async (
        pipeline: AiPipelineRun,
      ) => {
        const reason =
          window.prompt(
            "Enter a reason for cancelling this pipeline.",
          );

        if (
          reason === null
        ) {
          return;
        }

        try {
          setCancellingPipelineId(
            pipeline.id,
          );

          await cancelAiPipeline(
            pipeline.id,
            reason.trim() ||
              "Cancelled from AI workspace",
          );

          await loadData(
            true,
          );
        } catch (cancelError) {
          setError(
            cancelError instanceof Error
              ? cancelError.message
              : "Unable to cancel AI pipeline.",
          );
        } finally {
          setCancellingPipelineId(
            null,
          );
        }
      },
      [
        loadData,
      ],
    );

  if (
    loading &&
    !data
  ) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />

          <span className="text-sm">
            Loading AI processing data...
          </span>
        </div>
      </div>
    );
  }

  const summary =
    data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Bot className="size-6" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                AI Processing
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Monitor AI jobs, pipelines, workers and processing results.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadData(
              true,
            )
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={[
              "size-4",
              refreshing
                ? "animate-spin"
                : "",
            ].join(" ")}
          />

          Refresh
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
          <CircleAlert className="mt-0.5 size-5 shrink-0" />

          <div className="flex-1">
            <p className="font-medium">
              Unable to load AI data
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setError(
                null,
              )
            }
            className="text-xs font-medium"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Jobs"
          value={
            summary?.totalJobs ??
            0
          }
          description={
            `${summary?.queuedJobs ?? 0} queued`
          }
          icon={
            <Database className="size-5" />
          }
        />

        <MetricCard
          title="Active Jobs"
          value={
            summary?.activeJobs ??
            0
          }
          description="Currently processing"
          icon={
            <Activity className="size-5" />
          }
        />

        <MetricCard
          title="Completed"
          value={
            summary?.completedJobs ??
            0
          }
          description="Successfully completed jobs"
          icon={
            <CheckCircle2 className="size-5" />
          }
        />

        <MetricCard
          title="Failed"
          value={
            summary?.failedJobs ??
            0
          }
          description="Jobs requiring attention"
          icon={
            <CircleAlert className="size-5" />
          }
        />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border">
        {tabs.map(
          (
            tab,
          ) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.id,
                )
              }
              className={[
                "border-b-2 px-4 py-3 text-sm font-medium transition",
                activeTab ===
                tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ),
        )}
      </div>

      {activeTab ===
      "overview" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold">
                  Recent Processing Jobs
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Latest AI processing queue activity
                </p>
              </div>

              <Clock3 className="size-5 text-muted-foreground" />
            </div>

            <div className="divide-y divide-border">
              {visibleProcessingJobs
                .slice(
                  0,
                  6,
                )
                .map(
                  (
                    job,
                  ) => (
                    <ProcessingJobRow
                      key={job.id}
                      job={job}
                    />
                  ),
                )}

              {visibleProcessingJobs.length ===
              0 ? (
                <EmptyState
                  message="No AI processing jobs found."
                />
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold">
                  Pipeline Activity
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Current and recent AI pipeline runs
                </p>
              </div>

              <Workflow className="size-5 text-muted-foreground" />
            </div>

            <div className="divide-y divide-border">
              {visiblePipelineRuns
                .slice(
                  0,
                  6,
                )
                .map(
                  (
                    pipeline,
                  ) => (
                    <PipelineRow
                      key={pipeline.id}
                      pipeline={pipeline}
                      onCancel={() =>
                        void handleCancelPipeline(
                          pipeline,
                        )
                      }
                      cancelling={
                        cancellingPipelineId ===
                        pipeline.id
                      }
                    />
                  ),
                )}

              {visiblePipelineRuns.length ===
              0 ? (
                <EmptyState
                  message="No AI pipeline runs found."
                />
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {activeTab ===
      "jobs" ? (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">
              AI Jobs
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Orchestration and worker job activity.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b border-border bg-muted/30">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">
                    Job
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Type
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Worker
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Retries
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Queued
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {visibleJobs.map(
                  (
                    job,
                  ) => (
                    <AiJobTableRow
                      key={job.id}
                      job={job}
                    />
                  ),
                )}

                {visibleJobs.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={6}
                    >
                      <EmptyState
                        message="No AI jobs found."
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {activeTab ===
      "pipelines" ? (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">
              AI Pipeline Runs
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Track pipeline stages and processing progress.
            </p>
          </div>

          <div className="divide-y divide-border">
            {visiblePipelineRuns.map(
              (
                pipeline,
              ) => (
                <PipelineRow
                  key={pipeline.id}
                  pipeline={pipeline}
                  onCancel={() =>
                    void handleCancelPipeline(
                      pipeline,
                    )
                  }
                  cancelling={
                    cancellingPipelineId ===
                    pipeline.id
                  }
                  expanded
                />
              ),
            )}

            {visiblePipelineRuns.length ===
            0 ? (
              <EmptyState
                message="No AI pipeline runs found."
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {activeTab ===
      "results" ? (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">
              AI Processing Results
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Results generated by completed AI processing jobs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-border bg-muted/30">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">
                    Result
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Type
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Model
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Confidence
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {visibleResults.map(
                  (
                    result,
                  ) => (
                    <ResultTableRow
                      key={result.id}
                      result={result}
                    />
                  ),
                )}

                {visibleResults.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={5}
                    >
                      <EmptyState
                        message="No AI processing results found."
                      />
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ProcessingJobRow(
  {
    job,
  }: {
    job: AiProcessingJob;
  },
) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {formatLabel(
            job.jobType,
          )}
        </p>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {job.id}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <StatusBadge
          status={job.status}
        />

        <span className="text-xs text-muted-foreground">
          {formatDateTime(
            job.createdAt,
          )}
        </span>
      </div>
    </div>
  );
}

function PipelineRow(
  {
    pipeline,
    onCancel,
    cancelling,
    expanded = false,
  }: {
    pipeline: AiPipelineRun;
    onCancel: () => void;
    cancelling: boolean;
    expanded?: boolean;
  },
) {
  const totalStages =
    Math.max(
      pipeline.totalStages,
      0,
    );

  const completedStages =
    Math.min(
      pipeline.completedStages,
      totalStages || pipeline.completedStages,
    );

  const progress =
    totalStages > 0
      ? Math.min(
          100,
          Math.round(
            (
              completedStages /
              totalStages
            ) *
              100,
          ),
        )
      : 0;

  const canCancel =
    ![
      "completed",
      "failed",
      "cancelled",
      "canceled",
    ].includes(
      pipeline.status.toLowerCase(),
    );

  return (
    <div className="px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">
              {formatLabel(
                pipeline.pipelineKey,
              )}
            </p>

            <StatusBadge
              status={pipeline.status}
            />
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {pipeline.id}
          </p>

          {pipeline.currentStage ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Current stage:{" "}
              {formatLabel(
                pipeline.currentStage,
              )}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {expanded ? (
            <div className="min-w-[180px]">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>
                  Progress
                </span>

                <span>
                  {completedStages}
                  /
                  {totalStages}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {canCancel ? (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
            >
              {cancelling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <SquareX className="size-4" />
              )}

              Cancel
            </button>
          ) : null}
        </div>
      </div>

      {pipeline.errorMessage ? (
        <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400">
          {pipeline.errorMessage}
        </div>
      ) : null}
    </div>
  );
}

function AiJobTableRow(
  {
    job,
  }: {
    job: AiJob;
  },
) {
  return (
    <tr className="text-sm">
      <td className="px-5 py-4">
        <div className="font-medium">
          {job.id.slice(
            0,
            8,
          )}
        </div>

        <div className="mt-1 text-xs text-muted-foreground">
          Priority {job.priority}
        </div>
      </td>

      <td className="px-5 py-4">
        {formatLabel(
          job.jobType,
        )}
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={job.status}
        />
      </td>

      <td className="px-5 py-4 text-muted-foreground">
        {job.workerName ??
          "Unassigned"}
      </td>

      <td className="px-5 py-4">
        {job.retryCount}
        /
        {job.maxRetries}
      </td>

      <td className="px-5 py-4 text-muted-foreground">
        {formatDateTime(
          job.queuedAt,
        )}
      </td>
    </tr>
  );
}

function ResultTableRow(
  {
    result,
  }: {
    result: AiProcessingResult;
  },
) {
  const confidence =
    result.confidence === null
      ? "—"
      : `${Math.round(
          result.confidence *
            100,
        )}%`;

  return (
    <tr className="text-sm">
      <td className="px-5 py-4">
        <div className="font-medium">
          {result.id.slice(
            0,
            8,
          )}
        </div>

        <div className="mt-1 text-xs text-muted-foreground">
          Job {result.jobId.slice(
            0,
            8,
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        {formatLabel(
          result.resultType,
        )}
      </td>

      <td className="px-5 py-4">
        <div>
          {result.modelName}
        </div>

        {result.modelVersion ? (
          <div className="mt-1 text-xs text-muted-foreground">
            {result.modelVersion}
          </div>
        ) : null}
      </td>

      <td className="px-5 py-4">
        {confidence}
      </td>

      <td className="px-5 py-4 text-muted-foreground">
        {formatDateTime(
          result.createdAt,
        )}
      </td>
    </tr>
  );
}

function EmptyState(
  {
    message,
  }: {
    message: string;
  },
) {
  return (
    <div className="flex min-h-32 items-center justify-center px-5 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
