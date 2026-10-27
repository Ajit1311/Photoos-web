export type AiJobStatus =
  | "queued"
  | "running"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "retrying"
  | string;

export type AiPipelineStatus =
  | "queued"
  | "running"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | string;

export type AiProcessingJob = {
  id: string;

  workspaceId: string;

  jobType: string;

  status: AiJobStatus;

  assetId: string | null;

  albumId: string | null;

  priority: number;

  payload: Record<string, unknown>;

  attempts: number;

  maxAttempts: number;

  scheduledAt: string;

  startedAt: string | null;

  completedAt: string | null;

  failedAt: string | null;

  errorCode: string | null;

  errorMessage: string | null;

  lockedAt: string | null;

  lockedBy: string | null;

  createdBy: string | null;

  createdAt: string;

  updatedAt: string;
};

export type AiJob = {
  id: string;

  studioId: string;

  assetId: string | null;

  workflowRunId: string | null;

  jobType: string;

  status: AiJobStatus;

  priority: number;

  retryCount: number;

  maxRetries: number;

  workerName: string | null;

  queuedAt: string;

  startedAt: string | null;

  completedAt: string | null;

  inputPayload: Record<string, unknown>;

  outputPayload: Record<string, unknown>;

  errorMessage: string | null;

  metadata: Record<string, unknown>;

  createdAt: string;

  updatedAt: string;
};

export type AiProcessingResult = {
  id: string;

  workspaceId: string;

  jobId: string;

  assetId: string | null;

  resultType: string;

  modelName: string;

  modelVersion: string | null;

  confidence: number | null;

  resultData: Record<string, unknown>;

  reviewedAt: string | null;

  reviewedBy: string | null;

  createdAt: string;
};

export type AiPipelineRun = {
  id: string;

  workspaceId: string;

  assetId: string | null;

  albumId: string | null;

  pipelineKey: string;

  status: AiPipelineStatus;

  currentStage: string | null;

  totalStages: number;

  completedStages: number;

  failedStages: number;

  metadata: Record<string, unknown>;

  startedAt: string | null;

  completedAt: string | null;

  failedAt: string | null;

  errorCode: string | null;

  errorMessage: string | null;
};

export type AiExecutionHistory = {
  id: string;

  [key: string]: unknown;
};

export type AiDashboardSummary = {
  totalJobs: number;

  queuedJobs: number;

  activeJobs: number;

  completedJobs: number;

  failedJobs: number;

  cancelledJobs: number;

  totalPipelines: number;

  activePipelines: number;

  completedPipelines: number;

  failedPipelines: number;

  totalResults: number;
};

export type AiDashboardData = {
  summary: AiDashboardSummary;

  processingJobs: AiProcessingJob[];

  jobs: AiJob[];

  pipelineRuns: AiPipelineRun[];

  results: AiProcessingResult[];
};
