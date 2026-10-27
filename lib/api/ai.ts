import { supabase } from "@/lib/supabase/client";

import type {
  AiDashboardData,
  AiDashboardSummary,
  AiJob,
  AiJobStatus,
  AiPipelineRun,
  AiPipelineStatus,
  AiProcessingJob,
  AiProcessingResult,
} from "@/types/ai";

type JsonObject = Record<string, unknown>;

type AiProcessingJobRow = {
  id: string;
  workspace_id: string;
  job_type: string;
  status: string;
  asset_id: string | null;
  album_id: string | null;
  priority: number | string;
  payload: JsonObject | null;
  attempts: number | string;
  max_attempts: number | string;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  error_code: string | null;
  error_message: string | null;
  locked_at: string | null;
  locked_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type AiJobRow = {
  id: string;
  studio_id: string;
  asset_id: string | null;
  workflow_run_id: string | null;
  job_type: string;
  status: string;
  priority: number | string;
  retry_count: number | string;
  max_retries: number | string;
  worker_name: string | null;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
  input_payload: JsonObject | null;
  output_payload: JsonObject | null;
  error_message: string | null;
  metadata: JsonObject | null;
  created_at: string;
  updated_at: string;
};

type AiProcessingResultRow = {
  id: string;
  workspace_id: string;
  job_id: string;
  asset_id: string | null;
  result_type: string;
  model_name: string;
  model_version: string | null;
  confidence: number | string | null;
  result_data: JsonObject | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
};

type AiPipelineRunRow = {
  id: string;
  workspace_id: string;
  asset_id: string | null;
  album_id: string | null;
  pipeline_key: string;
  status: string;
  current_stage: string | null;
  total_stages: number | string;
  completed_stages: number | string;
  failed_stages: number | string;
  metadata: JsonObject | null;
  started_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  error_code: string | null;
  error_message: string | null;
};

function toNumber(
  value: number | string | null | undefined,
): number {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : 0;
  }

  return 0;
}

function toJsonObject(
  value: JsonObject | null | undefined,
): JsonObject {
  return value ?? {};
}

function mapAiProcessingJob(
  row: AiProcessingJobRow,
): AiProcessingJob {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    jobType: row.job_type,
    status: row.status as AiJobStatus,
    assetId: row.asset_id,
    albumId: row.album_id,
    priority: toNumber(row.priority),
    payload: toJsonObject(row.payload),
    attempts: toNumber(row.attempts),
    maxAttempts: toNumber(row.max_attempts),
    scheduledAt: row.scheduled_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    failedAt: row.failed_at,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    lockedAt: row.locked_at,
    lockedBy: row.locked_by,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAiJob(
  row: AiJobRow,
): AiJob {
  return {
    id: row.id,
    studioId: row.studio_id,
    assetId: row.asset_id,
    workflowRunId: row.workflow_run_id,
    jobType: row.job_type,
    status: row.status as AiJobStatus,
    priority: toNumber(row.priority),
    retryCount: toNumber(row.retry_count),
    maxRetries: toNumber(row.max_retries),
    workerName: row.worker_name,
    queuedAt: row.queued_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    inputPayload: toJsonObject(
      row.input_payload,
    ),
    outputPayload: toJsonObject(
      row.output_payload,
    ),
    errorMessage: row.error_message,
    metadata: toJsonObject(
      row.metadata,
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAiProcessingResult(
  row: AiProcessingResultRow,
): AiProcessingResult {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    jobId: row.job_id,
    assetId: row.asset_id,
    resultType: row.result_type,
    modelName: row.model_name,
    modelVersion: row.model_version,
    confidence:
      row.confidence === null
        ? null
        : toNumber(row.confidence),
    resultData: toJsonObject(
      row.result_data,
    ),
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    createdAt: row.created_at,
  };
}

function mapAiPipelineRun(
  row: AiPipelineRunRow,
): AiPipelineRun {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    assetId: row.asset_id,
    albumId: row.album_id,
    pipelineKey: row.pipeline_key,
    status: row.status as AiPipelineStatus,
    currentStage: row.current_stage,
    totalStages: toNumber(
      row.total_stages,
    ),
    completedStages: toNumber(
      row.completed_stages,
    ),
    failedStages: toNumber(
      row.failed_stages,
    ),
    metadata: toJsonObject(
      row.metadata,
    ),
    startedAt: row.started_at,
    completedAt: row.completed_at,
    failedAt: row.failed_at,
    errorCode: row.error_code,
    errorMessage: row.error_message,
  };
}

export async function getAiProcessingJobs(): Promise<
  AiProcessingJob[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("ai_processing_jobs")
    .select(`
      id,
      workspace_id,
      job_type,
      status,
      asset_id,
      album_id,
      priority,
      payload,
      attempts,
      max_attempts,
      scheduled_at,
      started_at,
      completed_at,
      failed_at,
      error_code,
      error_message,
      locked_at,
      locked_by,
      created_by,
      created_at,
      updated_at
    `)
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(100);

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (
    data ?? []
  ).map(
    (
      row,
    ) =>
      mapAiProcessingJob(
        row as AiProcessingJobRow,
      ),
  );
}

export async function getAiJobs(): Promise<
  AiJob[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("ai_jobs")
    .select(`
      id,
      studio_id,
      asset_id,
      workflow_run_id,
      job_type,
      status,
      priority,
      retry_count,
      max_retries,
      worker_name,
      queued_at,
      started_at,
      completed_at,
      input_payload,
      output_payload,
      error_message,
      metadata,
      created_at,
      updated_at
    `)
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(100);

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (
    data ?? []
  ).map(
    (
      row,
    ) =>
      mapAiJob(
        row as AiJobRow,
      ),
  );
}

export async function getAiProcessingResults(): Promise<
  AiProcessingResult[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("ai_processing_results")
    .select(`
      id,
      workspace_id,
      job_id,
      asset_id,
      result_type,
      model_name,
      model_version,
      confidence,
      result_data,
      reviewed_at,
      reviewed_by,
      created_at
    `)
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(100);

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (
    data ?? []
  ).map(
    (
      row,
    ) =>
      mapAiProcessingResult(
        row as AiProcessingResultRow,
      ),
  );
}

export async function getAiPipelineRuns(): Promise<
  AiPipelineRun[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("ai_pipeline_runs")
    .select(`
      id,
      workspace_id,
      asset_id,
      album_id,
      pipeline_key,
      status,
      current_stage,
      total_stages,
      completed_stages,
      failed_stages,
      metadata,
      started_at,
      completed_at,
      failed_at,
      error_code,
      error_message
    `)
    .order(
      "created_at",
      {
        ascending: false,
      },
    )
    .limit(100);

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (
    data ?? []
  ).map(
    (
      row,
    ) =>
      mapAiPipelineRun(
        row as AiPipelineRunRow,
      ),
  );
}

function buildAiDashboardSummary(
  processingJobs: AiProcessingJob[],
  jobs: AiJob[],
  pipelineRuns: AiPipelineRun[],
  results: AiProcessingResult[],
): AiDashboardSummary {
  const allStatuses = [
    ...processingJobs.map(
      (
        job,
      ) => job.status.toLowerCase(),
    ),
    ...jobs.map(
      (
        job,
      ) => job.status.toLowerCase(),
    ),
  ];

  const totalJobs =
    processingJobs.length +
    jobs.length;

  const queuedJobs =
    allStatuses.filter(
      (
        status,
      ) =>
        status === "queued" ||
        status === "pending",
    ).length;

  const activeJobs =
    allStatuses.filter(
      (
        status,
      ) =>
        status === "running" ||
        status === "processing" ||
        status === "in_progress",
    ).length;

  const completedJobs =
    allStatuses.filter(
      (
        status,
      ) =>
        status === "completed" ||
        status === "success",
    ).length;

  const failedJobs =
    allStatuses.filter(
      (
        status,
      ) =>
        status === "failed" ||
        status === "error",
    ).length;

  const cancelledJobs =
    allStatuses.filter(
      (
        status,
      ) =>
        status === "cancelled" ||
        status === "canceled",
    ).length;

  const pipelineStatuses =
    pipelineRuns.map(
      (
        pipeline,
      ) =>
        pipeline.status.toLowerCase(),
    );

  const activePipelines =
    pipelineStatuses.filter(
      (
        status,
      ) =>
        status === "running" ||
        status === "processing" ||
        status === "in_progress",
    ).length;

  const completedPipelines =
    pipelineStatuses.filter(
      (
        status,
      ) =>
        status === "completed" ||
        status === "success",
    ).length;

  const failedPipelines =
    pipelineStatuses.filter(
      (
        status,
      ) =>
        status === "failed" ||
        status === "error",
    ).length;

  return {
    totalJobs,
    queuedJobs,
    activeJobs,
    completedJobs,
    failedJobs,
    cancelledJobs,
    totalPipelines:
      pipelineRuns.length,
    activePipelines,
    completedPipelines,
    failedPipelines,
    totalResults:
      results.length,
  };
}

export async function getAiDashboardData(): Promise<
  AiDashboardData
> {
  const [
    processingJobsResult,
    jobsResult,
    pipelineRunsResult,
    resultsResult,
  ] = await Promise.all([
    getAiProcessingJobs(),
    getAiJobs(),
    getAiPipelineRuns(),
    getAiProcessingResults(),
  ]);

  const summary =
    buildAiDashboardSummary(
      processingJobsResult,
      jobsResult,
      pipelineRunsResult,
      resultsResult,
    );

  return {
    summary,
    processingJobs:
      processingJobsResult,
    jobs: jobsResult,
    pipelineRuns:
      pipelineRunsResult,
    results:
      resultsResult,
  };
}

export async function cancelAiPipeline(
  pipelineRunId: string,
  reason: string,
): Promise<boolean> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "cancel_ai_pipeline",
    {
      p_pipeline_run_id:
        pipelineRunId,
      p_reason:
        reason,
    },
  );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return Boolean(data);
}

export async function cancelAiProcessingJob(
  jobId: string,
): Promise<AiProcessingJob> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "cancel_ai_processing_job",
    {
      p_job_id: jobId,
    },
  );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return mapAiProcessingJob(
    data as AiProcessingJobRow,
  );
}
