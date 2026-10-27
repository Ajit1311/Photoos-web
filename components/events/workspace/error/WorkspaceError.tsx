"use client";

interface WorkspaceErrorProps {
  title?: string;
  description?: string;
  error?: Error | string | null;
  onRetry: () => void;
}

export default function WorkspaceError({
  title = "Unable to load workspace",
  description,
  error,
  onRetry,
}: WorkspaceErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl">⚠️</span>
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {description ?? (typeof error === "string" ? error : error?.message)}
          </p>
          <button
            onClick={onRetry}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Retry
          </button>
        </div>

      </div>
    </main>
  );
}